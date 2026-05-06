// =====================================================
// SALUD MARRANA - Registro de eventos
// =====================================================

// Definición de campos según tipo de evento
const CAMPOS_POR_TIPO = {
    sintoma: {
        emoji: '🤒',
        etiqueta: 'Síntoma',
        descripcionPlaceholder: 'Ej: Tos seca al dormir, fiebre 38.2°C',
        camposExtra: ['severidad'],
        sugerenciasTitulo: ['Resfrío', 'Tos', 'Fiebre', 'Dolor de cabeza', 'Dolor de estómago', 'Dolor de garganta', 'Vómitos', 'Diarrea', 'Alergia', 'Mareo', 'Cansancio']
    },
    consulta_medica: {
        emoji: '👩‍⚕️',
        etiqueta: 'Consulta médica',
        descripcionPlaceholder: 'Motivo y observaciones generales',
        camposExtra: ['medico_nombre', 'especialidad', 'centro_medico', 'diagnostico', 'indicaciones', 'proximo_control', 'costo_clp'],
        sugerenciasTitulo: ['Consulta general', 'Pediatría', 'Control', 'Urgencia', 'Especialista']
    },
    examen: {
        emoji: '🔬',
        etiqueta: 'Examen',
        descripcionPlaceholder: 'Detalle del examen',
        camposExtra: ['tipo_examen', 'laboratorio', 'fecha_resultado', 'interpretacion'],
        sugerenciasTitulo: ['Hemograma', 'Perfil bioquímico', 'Orina', 'Radiografía', 'Ecografía', 'Examen de sangre', 'Test de alergia']
    },
    medicamento: {
        emoji: '💊',
        etiqueta: 'Medicamento',
        descripcionPlaceholder: 'Detalle de la toma o tratamiento',
        camposExtra: ['med_nombre', 'med_dosis', 'med_frecuencia', 'med_via', 'med_tipo', 'med_fecha_inicio', 'med_fecha_fin', 'med_motivo', 'med_recetado_por'],
        sugerenciasTitulo: ['Paracetamol', 'Ibuprofeno', 'Antihistamínico', 'Antibiótico', 'Loratadina', 'Cetirizina']
    },
    vacuna: {
        emoji: '💉',
        etiqueta: 'Vacuna',
        descripcionPlaceholder: 'Notas sobre la vacuna',
        camposExtra: ['vac_lugar'],
        sugerenciasTitulo: ['Influenza', 'COVID-19', 'VPH', 'dTpa', 'Tres vírica', 'Hepatitis A', 'Hepatitis B']
    },
    hospitalizacion: {
        emoji: '🏥',
        etiqueta: 'Hospitalización / urgencia',
        descripcionPlaceholder: 'Motivo y detalles',
        camposExtra: ['centro_medico', 'diagnostico'],
        sugerenciasTitulo: ['Urgencia', 'Hospitalización', 'Cirugía']
    },
    control_preventivo: {
        emoji: '✅',
        etiqueta: 'Control preventivo',
        descripcionPlaceholder: 'Detalles del control',
        camposExtra: ['medico_nombre', 'especialidad', 'centro_medico', 'proximo_control'],
        sugerenciasTitulo: ['Niño sano', 'Control dental', 'Oftalmológico', 'Ginecológico', 'Cardiológico', 'PAP', 'Mamografía']
    },
    tratamiento_continuo: {
        emoji: '🔄',
        etiqueta: 'Tratamiento continuo',
        descripcionPlaceholder: 'Sesión o avance',
        camposExtra: ['medico_nombre', 'especialidad', 'centro_medico'],
        sugerenciasTitulo: ['Kinesiología', 'Psicología', 'Fonoaudiología', 'Terapia ocupacional', 'Nutricionista']
    },
    procedimiento: {
        emoji: '🩹',
        etiqueta: 'Procedimiento',
        descripcionPlaceholder: 'Tipo y detalles del procedimiento',
        camposExtra: ['medico_nombre', 'centro_medico'],
        sugerenciasTitulo: ['Sutura', 'Curación', 'Extracción', 'Limpieza dental']
    },
    alergia: {
        emoji: '⚠️',
        etiqueta: 'Alergia detectada',
        descripcionPlaceholder: 'Sustancia o desencadenante',
        camposExtra: ['severidad'],
        sugerenciasTitulo: ['Alergia alimentaria', 'Alergia medicamento', 'Alergia ambiental', 'Alergia contacto']
    },
    medicion: {
        emoji: '📏',
        etiqueta: 'Medición',
        descripcionPlaceholder: 'Notas',
        camposExtra: ['med_peso', 'med_talla', 'med_presion_sis', 'med_presion_dia', 'med_temperatura'],
        sugerenciasTitulo: ['Control de peso', 'Control de presión', 'Temperatura', 'Talla y peso']
    },
    salud_mental: {
        emoji: '🧠',
        etiqueta: 'Salud mental',
        descripcionPlaceholder: 'Detalle del estado o sesión',
        camposExtra: ['medico_nombre', 'centro_medico', 'severidad'],
        sugerenciasTitulo: ['Sesión psicología', 'Crisis ansiedad', 'Estado ánimo', 'Estrés', 'Control psiquiatra']
    }
};

// Cargar miembros para selector
async function cargarMiembrosParaSelector() {
    const { data, error } = await sb
        .from('miembros')
        .select('id, apodo, color_hex, emoji, fecha_nacimiento')
        .order('fecha_nacimiento', { ascending: true });
    return error ? [] : data;
}

// Renderizar selector de tipos de evento (paso 1 del formulario)
function renderizarSelectorTipos() {
    const cont = document.getElementById('tipos-grid');
    let html = '';
    for (const [tipo, def] of Object.entries(CAMPOS_POR_TIPO)) {
        html += `
            <div class="tipo-card" data-tipo="${tipo}" onclick="seleccionarTipo('${tipo}')">
                <div class="tipo-emoji">${def.emoji}</div>
                <div class="tipo-label">${def.etiqueta}</div>
            </div>
        `;
    }
    cont.innerHTML = html;
}

// Renderizar selector de miembros
function renderizarSelectorMiembros(miembros, miembroPreseleccionado = null) {
    const cont = document.getElementById('miembros-selector');
    let html = '';
    miembros.forEach(m => {
        const seleccionado = m.id === miembroPreseleccionado ? 'seleccionado' : '';
        html += `
            <div class="miembro-chip ${seleccionado}" data-id="${m.id}" onclick="seleccionarMiembro('${m.id}')" style="--color-miembro: ${m.color_hex};">
                <span class="miembro-chip-emoji">${m.emoji}</span>
                <span class="miembro-chip-nombre">${m.apodo}</span>
            </div>
        `;
    });
    cont.innerHTML = html;
}

// Estado del formulario
const formState = {
    miembroId: null,
    tipo: null,
    miembros: []
};

window.seleccionarTipo = function(tipo) {
    formState.tipo = tipo;
    document.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('seleccionado'));
    document.querySelector(`.tipo-card[data-tipo="${tipo}"]`).classList.add('seleccionado');

    // Mostrar paso 3 (formulario)
    renderizarFormularioCampos(tipo);
    document.getElementById('paso-3').style.display = 'block';
    document.getElementById('paso-3').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.seleccionarMiembro = function(id) {
    formState.miembroId = id;
    document.querySelectorAll('.miembro-chip').forEach(c => c.classList.remove('seleccionado'));
    document.querySelector(`.miembro-chip[data-id="${id}"]`).classList.add('seleccionado');

    // Mostrar paso 2 (tipos)
    document.getElementById('paso-2').style.display = 'block';
    document.getElementById('paso-2').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Renderizar campos según tipo elegido
function renderizarFormularioCampos(tipo) {
    const def = CAMPOS_POR_TIPO[tipo];
    const cont = document.getElementById('campos-extra');
    const hoy = new Date().toISOString().split('T')[0];

    // Construir datalist de sugerencias
    const datalistId = 'sugerencias-titulo';
    const datalist = `
        <datalist id="${datalistId}">
            ${def.sugerenciasTitulo.map(s => `<option value="${s}">`).join('')}
        </datalist>
    `;

    // Campos comunes
    let html = `
        ${datalist}
        <div class="form-group">
            <label for="evt-titulo">Título *</label>
            <input type="text" id="evt-titulo" class="form-input" list="${datalistId}" placeholder="Ej: ${def.sugerenciasTitulo[0]}" required>
        </div>
        <div class="form-grid-2">
            <div class="form-group">
                <label for="evt-fecha">Fecha *</label>
                <input type="date" id="evt-fecha" class="form-input" value="${hoy}" required>
            </div>
            <div class="form-group">
                <label for="evt-hora">Hora (opcional)</label>
                <input type="time" id="evt-hora" class="form-input">
            </div>
        </div>
        <div class="form-group">
            <label for="evt-descripcion">Descripción</label>
            <textarea id="evt-descripcion" class="form-input form-textarea" placeholder="${def.descripcionPlaceholder}" rows="3"></textarea>
        </div>
    `;

    // Campos específicos
    const campos = def.camposExtra;

    if (campos.includes('severidad')) {
        html += `
            <div class="form-group">
                <label>Severidad</label>
                <div class="severidad-opciones">
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="leve" checked><span>🟢 Leve</span></label>
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="moderado"><span>🟡 Moderado</span></label>
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="severo"><span>🔴 Severo</span></label>
                </div>
            </div>
        `;
    }

    // Consulta médica / preventiva / tratamiento
    if (campos.includes('medico_nombre')) {
        html += `<div class="form-group"><label for="evt-medico">Médico/profesional</label><input type="text" id="evt-medico" class="form-input" placeholder="Dr/a. Nombre Apellido"></div>`;
    }
    if (campos.includes('especialidad')) {
        html += `<div class="form-group"><label for="evt-especialidad">Especialidad</label><input type="text" id="evt-especialidad" class="form-input" placeholder="Ej: Pediatría, Dermatología"></div>`;
    }
    if (campos.includes('centro_medico')) {
        html += `<div class="form-group"><label for="evt-centro">Centro médico</label><input type="text" id="evt-centro" class="form-input" placeholder="Ej: Clínica Las Condes"></div>`;
    }
    if (campos.includes('diagnostico')) {
        html += `<div class="form-group"><label for="evt-diagnostico">Diagnóstico</label><textarea id="evt-diagnostico" class="form-input form-textarea" rows="2"></textarea></div>`;
    }
    if (campos.includes('indicaciones')) {
        html += `<div class="form-group"><label for="evt-indicaciones">Indicaciones</label><textarea id="evt-indicaciones" class="form-input form-textarea" rows="2"></textarea></div>`;
    }
    if (campos.includes('proximo_control')) {
        html += `<div class="form-group"><label for="evt-proximo">Próximo control (opcional)</label><input type="date" id="evt-proximo" class="form-input"><small style="color: var(--texto-secundario); font-size: 12px;">Si lo agregas, se crea un recordatorio automático</small></div>`;
    }
    if (campos.includes('costo_clp')) {
        html += `<div class="form-group"><label for="evt-costo">Costo (CLP)</label><input type="number" id="evt-costo" class="form-input" placeholder="0"></div>`;
    }

    // Examen
    if (campos.includes('tipo_examen')) {
        html += `<div class="form-group"><label for="evt-tipo-examen">Tipo de examen</label><input type="text" id="evt-tipo-examen" class="form-input" placeholder="Ej: Sangre, Imagen"></div>`;
    }
    if (campos.includes('laboratorio')) {
        html += `<div class="form-group"><label for="evt-lab">Laboratorio</label><input type="text" id="evt-lab" class="form-input"></div>`;
    }
    if (campos.includes('fecha_resultado')) {
        html += `<div class="form-group"><label for="evt-fecha-resultado">Fecha del resultado</label><input type="date" id="evt-fecha-resultado" class="form-input"></div>`;
    }
    if (campos.includes('interpretacion')) {
        html += `<div class="form-group"><label for="evt-interpretacion">Interpretación / observaciones</label><textarea id="evt-interpretacion" class="form-input form-textarea" rows="2"></textarea></div>`;
    }

    // Medicamento
    if (campos.includes('med_nombre')) {
        html += `
            <div class="form-group"><label for="med-nombre">Nombre del medicamento *</label><input type="text" id="med-nombre" class="form-input" list="sugerencias-titulo" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label for="med-dosis">Dosis</label><input type="text" id="med-dosis" class="form-input" placeholder="500mg"></div>
                <div class="form-group"><label for="med-frecuencia">Frecuencia</label><input type="text" id="med-frecuencia" class="form-input" placeholder="cada 8h"></div>
            </div>
            <div class="form-group"><label for="med-via">Vía</label><select id="med-via" class="form-input"><option value="">Seleccionar</option><option>Oral</option><option>Tópica</option><option>Intramuscular</option><option>Inhalada</option><option>Subcutánea</option><option>Otra</option></select></div>
            <div class="form-group">
                <label>Tipo de uso *</label>
                <div class="severidad-opciones">
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="puntual" checked><span>💊 Puntual</span></label>
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="regular"><span>🔄 Regular/Crónico</span></label>
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="asociado_enfermedad"><span>🤒 Por enfermedad</span></label>
                </div>
                <small style="color: var(--texto-secundario); font-size: 12px; display: block; margin-top: 8px;">
                    <b>Puntual</b>: una toma específica · <b>Regular</b>: en curso indefinido · <b>Por enfermedad</b>: tratamiento con duración
                </small>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label for="med-fecha-inicio">Inicio</label><input type="date" id="med-fecha-inicio" class="form-input" value="${hoy}"></div>
                <div class="form-group"><label for="med-fecha-fin">Fin (opcional)</label><input type="date" id="med-fecha-fin" class="form-input"></div>
            </div>
            <div class="form-group"><label for="med-motivo">Motivo</label><input type="text" id="med-motivo" class="form-input" placeholder="Ej: Rinitis crónica"></div>
            <div class="form-group"><label for="med-recetado-por">Recetado por (opcional)</label><input type="text" id="med-recetado-por" class="form-input"></div>
        `;
    }

    // Vacuna
    if (campos.includes('vac_lugar')) {
        html += `
            <div class="form-group">
                <label for="vac-lugar">Dónde se la pusieron</label>
                <select id="vac-lugar" class="form-input">
                    <option value="">Seleccionar</option>
                    <option value="colegio">Colegio</option>
                    <option value="farmacia">Farmacia</option>
                    <option value="consultorio">Consultorio</option>
                    <option value="clinica">Clínica</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
        `;
    }

    // Mediciones
    if (campos.includes('med_peso')) {
        html += `
            <div class="form-grid-2">
                <div class="form-group"><label for="med-peso">Peso (kg)</label><input type="number" id="med-peso" class="form-input" step="0.1" placeholder="0.0"></div>
                <div class="form-group"><label for="med-talla">Talla (cm)</label><input type="number" id="med-talla" class="form-input" step="0.1" placeholder="0"></div>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label for="med-presion-sis">Presión sistólica</label><input type="number" id="med-presion-sis" class="form-input" placeholder="120"></div>
                <div class="form-group"><label for="med-presion-dia">Presión diastólica</label><input type="number" id="med-presion-dia" class="form-input" placeholder="80"></div>
            </div>
            <div class="form-group"><label for="med-temp">Temperatura (°C)</label><input type="number" id="med-temp" class="form-input" step="0.1" placeholder="36.5"></div>
        `;
    }

    // Tags libres (siempre disponibles)
    html += `
        <div class="form-group">
            <label for="evt-tags">Etiquetas (opcional)</label>
            <input type="text" id="evt-tags" class="form-input" placeholder="Ej: invierno, colegio, alergia (separadas por coma)">
            <small style="color: var(--texto-secundario); font-size: 12px;">Útiles para filtrar después</small>
        </div>
    `;

    cont.innerHTML = html;
}

// Guardar el evento
async function guardarEvento() {
    const btn = document.getElementById('btn-guardar');
    const tipo = formState.tipo;
    const miembroId = formState.miembroId;

    if (!miembroId) return mostrarToast('Falta elegir el miembro', 'error');
    if (!tipo) return mostrarToast('Falta elegir el tipo de evento', 'error');

    const titulo = document.getElementById('evt-titulo').value.trim();
    const fecha = document.getElementById('evt-fecha').value;

    // Para medicamentos, el "título" lo construimos del nombre del medicamento
    let tituloFinal = titulo;
    if (tipo === 'medicamento') {
        const medNombre = document.getElementById('med-nombre')?.value.trim();
        if (!medNombre) return mostrarToast('Falta el nombre del medicamento', 'error');
        tituloFinal = titulo || medNombre;
    }

    if (!tituloFinal) return mostrarToast('Falta el título', 'error');
    if (!fecha) return mostrarToast('Falta la fecha', 'error');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
        // 1. Crear el evento principal
        const tagsInput = document.getElementById('evt-tags')?.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : null;

        const severidadEl = document.querySelector('input[name="severidad"]:checked');

        const eventoData = {
            miembro_id: miembroId,
            tipo,
            fecha,
            hora: document.getElementById('evt-hora').value || null,
            titulo: tituloFinal,
            descripcion: document.getElementById('evt-descripcion').value.trim() || null,
            severidad: severidadEl ? severidadEl.value : null,
            metodo_registro: 'formulario',
            tags
        };

        const { data: evento, error: errEvt } = await sb
            .from('eventos')
            .insert(eventoData)
            .select()
            .single();

        if (errEvt) throw errEvt;

        // 2. Insertar detalle según tipo
        const def = CAMPOS_POR_TIPO[tipo];
        const campos = def.camposExtra;

        // Consulta médica / preventivo / tratamiento / hospitalización / procedimiento / salud mental
        const tieneConsulta = campos.includes('medico_nombre') || campos.includes('diagnostico') || campos.includes('indicaciones');
        if (tieneConsulta) {
            const consultaData = {
                evento_id: evento.id,
                medico_nombre: document.getElementById('evt-medico')?.value.trim() || null,
                especialidad: document.getElementById('evt-especialidad')?.value.trim() || null,
                centro_medico: document.getElementById('evt-centro')?.value.trim() || null,
                diagnostico: document.getElementById('evt-diagnostico')?.value.trim() || null,
                indicaciones: document.getElementById('evt-indicaciones')?.value.trim() || null,
                proximo_control: document.getElementById('evt-proximo')?.value || null,
                costo_clp: document.getElementById('evt-costo')?.value ? parseInt(document.getElementById('evt-costo').value) : null
            };
            await sb.from('consultas_medicas').insert(consultaData);

            // Si hay próximo control, crear recordatorio
            if (consultaData.proximo_control) {
                await sb.from('recordatorios').insert({
                    miembro_id: miembroId,
                    titulo: `Control: ${tituloFinal}`,
                    descripcion: consultaData.medico_nombre || '',
                    fecha: consultaData.proximo_control,
                    tipo: 'control'
                });
            }
        }

        // Examen
        if (campos.includes('tipo_examen')) {
            await sb.from('examenes').insert({
                evento_id: evento.id,
                tipo_examen: document.getElementById('evt-tipo-examen')?.value.trim() || null,
                laboratorio: document.getElementById('evt-lab')?.value.trim() || null,
                fecha_solicitud: fecha,
                fecha_resultado: document.getElementById('evt-fecha-resultado')?.value || null,
                interpretacion: document.getElementById('evt-interpretacion')?.value.trim() || null
            });
        }

        // Medicamento
        if (campos.includes('med_nombre')) {
            const tipoMedEl = document.querySelector('input[name="med-tipo"]:checked');
            const tipoMed = tipoMedEl ? tipoMedEl.value : 'puntual';
            const fechaFin = document.getElementById('med-fecha-fin')?.value || null;

            // En curso si es regular sin fecha fin, o asociado a enfermedad con fecha fin futura
            let enCurso = false;
            const hoy = new Date().toISOString().split('T')[0];
            if (tipoMed === 'regular') {
                enCurso = !fechaFin || fechaFin >= hoy;
            } else if (tipoMed === 'asociado_enfermedad') {
                enCurso = fechaFin && fechaFin >= hoy;
            }

            await sb.from('medicamentos').insert({
                evento_id: evento.id,
                miembro_id: miembroId,
                nombre: document.getElementById('med-nombre').value.trim(),
                dosis: document.getElementById('med-dosis')?.value.trim() || null,
                frecuencia: document.getElementById('med-frecuencia')?.value.trim() || null,
                via: document.getElementById('med-via')?.value || null,
                tipo: tipoMed,
                fecha_inicio: document.getElementById('med-fecha-inicio')?.value || fecha,
                fecha_fin: fechaFin,
                en_curso: enCurso,
                motivo: document.getElementById('med-motivo')?.value.trim() || null,
                recetado_por: document.getElementById('med-recetado-por')?.value.trim() || null
            });
        }

        // Vacuna
        if (campos.includes('vac_lugar')) {
            await sb.from('vacunas').insert({
                evento_id: evento.id,
                miembro_id: miembroId,
                nombre: tituloFinal,
                fecha,
                lugar: document.getElementById('vac-lugar')?.value || 'otro'
            });
        }

        // Medición
        if (campos.includes('med_peso')) {
            const peso = document.getElementById('med-peso')?.value;
            const talla = document.getElementById('med-talla')?.value;
            let imc = null;
            if (peso && talla) {
                const tallaM = parseFloat(talla) / 100;
                imc = (parseFloat(peso) / (tallaM * tallaM)).toFixed(2);
            }
            await sb.from('mediciones').insert({
                evento_id: evento.id,
                miembro_id: miembroId,
                fecha,
                peso_kg: peso ? parseFloat(peso) : null,
                talla_cm: talla ? parseFloat(talla) : null,
                imc,
                presion_sistolica: document.getElementById('med-presion-sis')?.value ? parseInt(document.getElementById('med-presion-sis').value) : null,
                presion_diastolica: document.getElementById('med-presion-dia')?.value ? parseInt(document.getElementById('med-presion-dia').value) : null,
                temperatura: document.getElementById('med-temp')?.value ? parseFloat(document.getElementById('med-temp').value) : null
            });
        }

        mostrarToast('Evento registrado ✅', 'exito');

        // Redirigir al perfil del miembro
        setTimeout(() => {
            window.location.href = `perfil.html?id=${miembroId}`;
        }, 1000);
    } catch (err) {
        console.error('Error guardando evento:', err);
        mostrarToast('Error al guardar: ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Guardar evento';
    }
}
