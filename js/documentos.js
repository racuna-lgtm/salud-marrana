// =====================================================
// SALUD MARRANA - Gestión de documentos (fotos y PDFs)
// =====================================================

const DOC_CONFIG = {
    bucket: 'documentos',
    maxSizeMB: 5,
    compresionImagen: {
        maxAncho: 1600,
        maxAlto: 1600,
        calidad: 0.75
    },
    formatosImagen: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    formatosPDF: ['application/pdf']
};

const TIPOS_DOCUMENTO = {
    receta: { emoji: '📄', label: 'Receta médica' },
    examen: { emoji: '🔬', label: 'Examen / resultado' },
    informe: { emoji: '📋', label: 'Informe médico' },
    carnet_vacuna: { emoji: '💉', label: 'Carnet de vacunas' },
    otro: { emoji: '📎', label: 'Otro' }
};

const docsPendientes = [];

async function comprimirImagen(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const { maxAncho, maxAlto, calidad } = DOC_CONFIG.compresionImagen;
                let { width, height } = img;

                if (width > maxAncho || height > maxAlto) {
                    const ratio = Math.min(maxAncho / width, maxAlto / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('No se pudo comprimir'));
                        resolve(blob);
                    },
                    'image/jpeg',
                    calidad
                );
            };
            img.onerror = () => reject(new Error('No se pudo leer la imagen'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
        reader.readAsDataURL(file);
    });
}

function validarArchivo(file) {
    const sizeMB = file.size / (1024 * 1024);
    const esImagen = DOC_CONFIG.formatosImagen.includes(file.type);
    const esPDF = DOC_CONFIG.formatosPDF.includes(file.type);

    if (!esImagen && !esPDF) {
        return { ok: false, error: 'Solo se permiten imágenes (JPG, PNG, HEIC) o PDFs' };
    }

    if (esPDF && sizeMB > DOC_CONFIG.maxSizeMB) {
        return { ok: false, error: `El PDF excede ${DOC_CONFIG.maxSizeMB}MB` };
    }

    return { ok: true, esImagen, esPDF };
}

async function agregarDocPendiente(file) {
    const validacion = validarArchivo(file);
    if (!validacion.ok) {
        mostrarToast(validacion.error, 'error');
        return null;
    }

    let archivoFinal = file;
    let preview = null;

    if (validacion.esImagen) {
        try {
            archivoFinal = await comprimirImagen(file);
            preview = URL.createObjectURL(archivoFinal);
        } catch (err) {
            console.error('Error comprimiendo:', err);
            mostrarToast('Error procesando imagen', 'error');
            return null;
        }
    }

    const doc = {
        id: 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        file: archivoFinal,
        nombreOriginal: file.name,
        mimeType: validacion.esImagen ? 'image/jpeg' : file.type,
        esImagen: validacion.esImagen,
        esPDF: validacion.esPDF,
        preview,
        tipo: 'otro'
    };

    docsPendientes.push(doc);
    return doc;
}

async function subirDocumento(doc, miembroId, eventoId) {
    const ext = doc.esImagen ? 'jpg' : 'pdf';
    const timestamp = Date.now();
    const nombreLimpio = doc.nombreOriginal
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.[^.]+$/, '');
    const nombreFinal = `${timestamp}-${nombreLimpio}.${ext}`;
    const ruta = `${miembroId}/${eventoId}/${nombreFinal}`;

    const { data: uploadData, error: uploadErr } = await sb.storage
        .from(DOC_CONFIG.bucket)
        .upload(ruta, doc.file, {
            contentType: doc.mimeType,
            cacheControl: '3600',
            upsert: false
        });

    if (uploadErr) throw uploadErr;

    const { data: docRow, error: insertErr } = await sb
        .from('documentos')
        .insert({
            evento_id: eventoId,
            miembro_id: miembroId,
            tipo: doc.tipo,
            nombre_archivo: doc.nombreOriginal,
            ruta_storage: ruta,
            tamano_bytes: doc.file.size,
            mime_type: doc.mimeType
        })
        .select()
        .single();

    if (insertErr) throw insertErr;
    return docRow;
}

async function subirDocsPendientes(miembroId, eventoId) {
    if (docsPendientes.length === 0) return { exitos: 0, errores: 0 };

    let exitos = 0;
    let errores = 0;

    for (const doc of docsPendientes) {
        try {
            await subirDocumento(doc, miembroId, eventoId);
            exitos++;
        } catch (err) {
            console.error(`Error subiendo ${doc.nombreOriginal}:`, err);
            errores++;
        }
    }

    docsPendientes.forEach(d => {
        if (d.preview) URL.revokeObjectURL(d.preview);
    });
    docsPendientes.length = 0;

    return { exitos, errores };
}

async function obtenerUrlFirmada(rutaStorage, expiraSegundos = 3600) {
    const { data, error } = await sb.storage
        .from(DOC_CONFIG.bucket)
        .createSignedUrl(rutaStorage, expiraSegundos);

    if (error) {
        console.error('Error generando URL firmada:', error);
        return null;
    }
    return data.signedUrl;
}

async function obtenerDocsDeEvento(eventoId) {
    const { data, error } = await sb
        .from('documentos')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error cargando docs:', error);
        return [];
    }
    return data || [];
}

async function eliminarDocumento(docId, rutaStorage) {
    if (!confirm('¿Eliminar este documento?')) return false;

    try {
        await sb.storage.from(DOC_CONFIG.bucket).remove([rutaStorage]);
        const { error } = await sb.from('documentos').delete().eq('id', docId);
        if (error) throw error;

        mostrarToast('Documento eliminado', 'exito');
        return true;
    } catch (err) {
        console.error(err);
        mostrarToast('Error al eliminar', 'error');
        return false;
    }
}

function renderizarDocsPendientes() {
    const cont = document.getElementById('docs-pendientes-lista');
    if (!cont) return;

    if (docsPendientes.length === 0) {
        cont.innerHTML = '<p style="color: var(--texto-secundario); font-size: 13px; font-style: italic;">No hay documentos adjuntos</p>';
        return;
    }

    let html = '';
    docsPendientes.forEach(doc => {
        html += `
            <div class="doc-pendiente">
                <div class="doc-pendiente-preview">
                    ${doc.esImagen
                        ? `<img src="${doc.preview}" alt="preview">`
                        : `<div class="doc-icono-pdf">📄 PDF</div>`
                    }
                </div>
                <div class="doc-pendiente-info">
                    <div class="doc-pendiente-nombre">${doc.nombreOriginal}</div>
                    <select class="form-input doc-tipo-select" onchange="cambiarTipoDoc('${doc.id}', this.value)">
                        ${Object.entries(TIPOS_DOCUMENTO).map(([key, val]) => `
                            <option value="${key}" ${doc.tipo === key ? 'selected' : ''}>${val.emoji} ${val.label}</option>
                        `).join('')}
                    </select>
                </div>
                <button type="button" class="doc-pendiente-eliminar" onclick="quitarDocPendiente('${doc.id}')">✕</button>
            </div>
        `;
    });
    cont.innerHTML = html;
}

window.cambiarTipoDoc = function(docId, nuevoTipo) {
    const doc = docsPendientes.find(d => d.id === docId);
    if (doc) doc.tipo = nuevoTipo;
};

window.quitarDocPendiente = function(docId) {
    const idx = docsPendientes.findIndex(d => d.id === docId);
    if (idx >= 0) {
        const doc = docsPendientes[idx];
        if (doc.preview) URL.revokeObjectURL(doc.preview);
        docsPendientes.splice(idx, 1);
        renderizarDocsPendientes();
    }
};

window.manejarSeleccionArchivos = async function(input) {
    const archivos = Array.from(input.files);
    if (archivos.length === 0) return;

    mostrarToast(`Procesando ${archivos.length} archivo${archivos.length > 1 ? 's' : ''}...`, 'info');

    for (const file of archivos) {
        await agregarDocPendiente(file);
    }

    renderizarDocsPendientes();
    input.value = '';
};

function htmlUploaderDocs() {
    return `
        <div class="docs-uploader">
            <h4 style="margin-bottom: 10px;">📎 Documentos asociados (opcional)</h4>
            <p style="font-size: 12px; color: var(--texto-secundario); margin-bottom: 12px;">
                Puedes adjuntar fotos de recetas, exámenes, indicaciones, etc.
            </p>

            <div class="docs-botones">
                <label class="btn-doc-upload">
                    📷 Sacar foto
                    <input type="file" accept="image/*" capture="environment" onchange="manejarSeleccionArchivos(this)" multiple>
                </label>
                <label class="btn-doc-upload">
                    🖼️ De galería
                    <input type="file" accept="image/*" onchange="manejarSeleccionArchivos(this)" multiple>
                </label>
                <label class="btn-doc-upload">
                    📄 PDF
                    <input type="file" accept="application/pdf" onchange="manejarSeleccionArchivos(this)" multiple>
                </label>
            </div>

            <div id="docs-pendientes-lista" style="margin-top: 16px;">
                <p style="color: var(--texto-secundario); font-size: 13px; font-style: italic;">No hay documentos adjuntos</p>
            </div>
        </div>
    `;
}

async function renderizarDocsGuardados(contenedorId, eventoId) {
    const cont = document.getElementById(contenedorId);
    if (!cont) return;

    const docs = await obtenerDocsDeEvento(eventoId);

    if (docs.length === 0) {
        cont.innerHTML = '<p style="color: var(--texto-secundario); font-size: 13px; font-style: italic;">Sin documentos adjuntos</p>';
        return;
    }

    let html = '<div class="docs-guardados-grid">';
    for (const doc of docs) {
        const tipoInfo = TIPOS_DOCUMENTO[doc.tipo] || TIPOS_DOCUMENTO.otro;
        const esImagen = doc.mime_type && doc.mime_type.startsWith('image/');

        html += `
            <div class="doc-guardado">
                <div class="doc-guardado-preview" onclick="abrirDoc('${doc.id}', '${doc.ruta_storage}', '${doc.mime_type}')">
                    ${esImagen
                        ? `<div class="doc-thumb" data-ruta="${doc.ruta_storage}"><div class="spinner-mini"></div></div>`
                        : `<div class="doc-icono-pdf-grande">📄<br><small>PDF</small></div>`
                    }
                </div>
                <div class="doc-guardado-info">
                    <div class="doc-guardado-tipo">${tipoInfo.emoji} ${tipoInfo.label}</div>
                    <div class="doc-guardado-nombre">${doc.nombre_archivo}</div>
                </div>
                <button class="doc-guardado-eliminar" onclick="eliminarDocHandler('${doc.id}', '${doc.ruta_storage}')">🗑️</button>
            </div>
        `;
    }
    html += '</div>';
    cont.innerHTML = html;

    const thumbs = cont.querySelectorAll('.doc-thumb');
    for (const thumb of thumbs) {
        const ruta = thumb.dataset.ruta;
        const url = await obtenerUrlFirmada(ruta, 3600);
        if (url) {
            thumb.innerHTML = `<img src="${url}" alt="documento">`;
        } else {
            thumb.innerHTML = '❌';
        }
    }
}

window.abrirDoc = async function(docId, rutaStorage, mimeType) {
    const url = await obtenerUrlFirmada(rutaStorage, 3600);
    if (!url) {
        mostrarToast('No se pudo abrir el documento', 'error');
        return;
    }
    window.open(url, '_blank');
};

window.eliminarDocHandler = async function(docId, rutaStorage) {
    const ok = await eliminarDocumento(docId, rutaStorage);
    if (ok) {
        const params = new URLSearchParams(window.location.search);
        const eventoId = params.get('id');
        if (eventoId) {
            await renderizarDocsGuardados('docs-evento-lista', eventoId);
        }
    }
};
