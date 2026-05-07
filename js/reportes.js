// =====================================================
// SALUD MARRANA - Reportes, gráficos y exportar PDF
// =====================================================

const COLORES_GRAFICO = ['#9B5DE5', '#7FD858', '#06A77D', '#00BBF9', '#F59E0B', '#EF4444', '#3B82F6', '#10B981'];

// Cargar datos generales
async function cargarDatosReporte(miembroId = null, mesesAtras = 12) {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras);
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

    let query = sb
        .from('eventos')
        .select('*, miembros(apodo, color_hex, emoji)')
        .gte('fecha', fechaInicioStr)
        .order('fecha', { ascending: true });

    if (miembroId) query = query.eq('miembro_id', miembroId);

    const { data: eventos } = await query;

    // Cargar consultas asociadas para análisis de especialidad
    const eventosIds = (eventos || []).map(e => e.id);
    let consultas = [];
    if (eventosIds.length > 0) {
        const { data } = await sb
            .from('consultas_medicas')
            .select('*')
            .in('evento_id', eventosIds);
        consultas = data || [];
    }

    // Mediciones
    let queryMed = sb.from('mediciones').select('*, miembros(apodo, color_hex)').gte('fecha', fechaInicioStr).order('fecha', { ascending: true });
    if (miembroId) queryMed = queryMed.eq('miembro_id', miembroId);
    const { data: mediciones } = await queryMed;

    // Medicamentos
    let queryMeds = sb.from('medicamentos').select('*, miembros(apodo, color_hex)').gte('fecha_inicio', fechaInicioStr);
    if (miembroId) queryMeds = queryMeds.eq('miembro_id', miembroId);
    const { data: medicamentos } = await queryMeds;

    return {
        eventos: eventos || [],
        consultas,
        mediciones: mediciones || [],
        medicamentos: medicamentos || []
    };
}

// =====================================================
// ESTADÍSTICAS RESUMEN
// =====================================================
function calcularEstadisticas(datos) {
    const eventos = datos.eventos;
    const totalEventos = eventos.length;
    const sintomas = eventos.filter(e => e.tipo === 'sintoma').length;
    const consultas = eventos.filter(e => e.tipo === 'consulta_medica' || e.tipo === 'control_preventivo').length;
    const medicamentosTotal = datos.medicamentos.length;
    const enCurso = datos.medicamentos.filter(m => m.en_curso).length;

    // Promedio mensual
    const meses = new Set();
    eventos.forEach(e => {
        const m = e.fecha.substring(0, 7);
        meses.add(m);
    });
    const promedioMensual = meses.size > 0 ? (totalEventos / meses.size).toFixed(1) : 0;

    return {
        totalEventos,
        sintomas,
        consultas,
        medicamentosTotal,
        enCurso,
        promedioMensual
    };
}

// =====================================================
// GRÁFICO: SÍNTOMAS POR MES
// =====================================================
function graficoSintomasPorMes(canvasId, datos, miembroId = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const eventos = datos.eventos.filter(e => e.tipo === 'sintoma');
    if (eventos.length === 0) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📭</span><p>Sin síntomas registrados aún</p></div>';
        return;
    }

    // Agrupar por mes
    const porMes = {};
    eventos.forEach(e => {
        const mes = e.fecha.substring(0, 7);
        porMes[mes] = (porMes[mes] || 0) + 1;
    });

    const meses = Object.keys(porMes).sort();
    const valores = meses.map(m => porMes[m]);
    const labels = meses.map(m => {
        const [a, mm] = m.split('-');
        const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${nombresMes[parseInt(mm) - 1]} ${a.substring(2)}`;
    });

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Síntomas',
                data: valores,
                backgroundColor: 'rgba(155, 93, 229, 0.7)',
                borderColor: '#9B5DE5',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// =====================================================
// GRÁFICO: CONSULTAS POR ESPECIALIDAD
// =====================================================
function graficoConsultasPorEspecialidad(canvasId, datos) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const consultas = datos.consultas.filter(c => c.especialidad);
    if (consultas.length === 0) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📭</span><p>Sin consultas con especialidad registradas</p></div>';
        return;
    }

    const porEsp = {};
    consultas.forEach(c => {
        porEsp[c.especialidad] = (porEsp[c.especialidad] || 0) + 1;
    });

    const labels = Object.keys(porEsp);
    const valores = labels.map(l => porEsp[l]);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: COLORES_GRAFICO,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 12, font: { size: 12 } }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO: MEDICAMENTOS MÁS USADOS
// =====================================================
function graficoMedicamentosMasUsados(canvasId, datos) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const meds = datos.medicamentos;
    if (meds.length === 0) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📭</span><p>Sin medicamentos registrados aún</p></div>';
        return;
    }

    const porNombre = {};
    meds.forEach(m => {
        const nombre = m.nombre.toLowerCase();
        porNombre[nombre] = (porNombre[nombre] || 0) + 1;
    });

    // Top 8
    const top = Object.entries(porNombre)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const labels = top.map(t => t[0].charAt(0).toUpperCase() + t[0].slice(1));
    const valores = top.map(t => t[1]);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Veces registrado',
                data: valores,
                backgroundColor: COLORES_GRAFICO[1],
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// =====================================================
// GRÁFICO: CURVA DE PESO
// =====================================================
function graficoCurvaPeso(canvasId, datos, color = '#00BBF9') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const meds = datos.mediciones.filter(m => m.peso_kg);
    if (meds.length < 2) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📏</span><p>Necesitas al menos 2 mediciones de peso para ver la curva</p></div>';
        return;
    }

    const labels = meds.map(m => formatearFechaCorta(m.fecha));
    const valores = meds.map(m => parseFloat(m.peso_kg));

    new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data: valores,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: color,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// =====================================================
// GRÁFICO: CURVA DE TALLA
// =====================================================
function graficoCurvaTalla(canvasId, datos, color = '#06A77D') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const meds = datos.mediciones.filter(m => m.talla_cm);
    if (meds.length < 2) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📏</span><p>Necesitas al menos 2 mediciones de talla</p></div>';
        return;
    }

    const labels = meds.map(m => formatearFechaCorta(m.fecha));
    const valores = meds.map(m => parseFloat(m.talla_cm));

    new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Talla (cm)',
                data: valores,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: color,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// =====================================================
// GRÁFICO: EVENTOS POR TIPO (general)
// =====================================================
function graficoEventosPorTipo(canvasId, datos) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const eventos = datos.eventos;
    if (eventos.length === 0) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📭</span><p>Sin eventos registrados</p></div>';
        return;
    }

    const tipos = {};
    eventos.forEach(e => {
        tipos[e.tipo] = (tipos[e.tipo] || 0) + 1;
    });

    const labels = Object.keys(tipos).map(t => CAMPOS_POR_TIPO[t]?.etiqueta || t);
    const valores = Object.values(tipos);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: COLORES_GRAFICO,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } }
            }
        }
    });
}

// =====================================================
// GRÁFICO: COMPARATIVA FAMILIAR
// =====================================================
function graficoComparativaFamilia(canvasId, datos) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const eventos = datos.eventos;
    if (eventos.length === 0) {
        canvas.parentElement.innerHTML = '<div class="estado-vacio"><span class="emoji">📭</span><p>Sin eventos para comparar</p></div>';
        return;
    }

    const porMiembro = {};
    eventos.forEach(e => {
        const apodo = e.miembros?.apodo || 'Otros';
        const color = e.miembros?.color_hex || '#999';
        if (!porMiembro[apodo]) porMiembro[apodo] = { count: 0, color };
        porMiembro[apodo].count++;
    });

    const labels = Object.keys(porMiembro);
    const valores = labels.map(l => porMiembro[l].count);
    const colores = labels.map(l => porMiembro[l].color);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Eventos',
                data: valores,
                backgroundColor: colores,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// =====================================================
// EXPORTAR PDF
// =====================================================
async function exportarPDF(opciones) {
    const { miembroId, mesesAtras, incluirFotos } = opciones;

    mostrarToast('Generando PDF, esto puede tomar unos segundos...', 'info');

    try {
        // Cargar datos
        const datos = await cargarDatosReporte(miembroId, mesesAtras);
        const miembro = miembroId
            ? (await sb.from('miembros').select('*').eq('id', miembroId).single()).data
            : null;

        // Cargar condiciones crónicas y medicamentos en curso
        let condiciones = [];
        let medsEnCurso = [];
        if (miembroId) {
            const { data: c } = await sb.from('condiciones_cronicas').select('*').eq('miembro_id', miembroId).eq('activa', true);
            condiciones = c || [];
            const { data: m } = await sb.from('medicamentos').select('*').eq('miembro_id', miembroId).eq('en_curso', true);
            medsEnCurso = m || [];
        }

        const stats = calcularEstadisticas(datos);

        // Crear PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const ancho = 210;
        const alto = 297;
        const margen = 15;
        let y = margen;

        // ===== ENCABEZADO =====
        doc.setFillColor(155, 93, 229);
        doc.rect(0, 0, ancho, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('🐷 Salud Marrana', margen, 18);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Reporte familiar de salud', margen, 25);
        const fechaHoy = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Generado el ${fechaHoy}`, margen, 31);

        y = 45;
        doc.setTextColor(26, 26, 46);

        // ===== INFORMACIÓN DEL MIEMBRO =====
        if (miembro) {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(`Reporte de ${miembro.apodo}`, margen, y);
            y += 7;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(`Nombre completo: ${miembro.nombre}`, margen, y); y += 5;
            doc.text(`Fecha de nacimiento: ${formatearFechaCorta(miembro.fecha_nacimiento)}`, margen, y); y += 5;
            const esMagda = miembro.apodo === 'Magda';
            doc.text(`Edad: ${calcularEdad(miembro.fecha_nacimiento, esMagda)}`, margen, y); y += 5;
            doc.text(`Previsión: ${miembro.prevision || 'Sin registrar'}`, margen, y); y += 5;
            if (miembro.grupo_sanguineo) {
                doc.text(`Grupo sanguíneo: ${miembro.grupo_sanguineo}`, margen, y); y += 5;
            }
            y += 4;

            // Condiciones crónicas
            if (condiciones.length > 0) {
                doc.setTextColor(180, 83, 9);
                doc.setFont(undefined, 'bold');
                doc.text('Condiciones crónicas:', margen, y); y += 5;
                doc.setFont(undefined, 'normal');
                doc.setTextColor(107, 114, 128);
                condiciones.forEach(c => {
                    doc.text(`• ${c.nombre}${c.descripcion ? ' — ' + c.descripcion : ''}`, margen + 4, y);
                    y += 5;
                });
                y += 3;
            }

            // Medicamentos en curso
            if (medsEnCurso.length > 0) {
                doc.setTextColor(16, 185, 129);
                doc.setFont(undefined, 'bold');
                doc.text('💊 Medicamentos en curso:', margen, y); y += 5;
                doc.setFont(undefined, 'normal');
                doc.setTextColor(107, 114, 128);
                medsEnCurso.forEach(m => {
                    let linea = `• ${m.nombre}`;
                    if (m.dosis) linea += ` ${m.dosis}`;
                    if (m.frecuencia) linea += ` · ${m.frecuencia}`;
                    if (m.motivo) linea += ` (${m.motivo})`;
                    doc.text(linea, margen + 4, y);
                    y += 5;
                });
                y += 3;
            }
        }

        // ===== ESTADÍSTICAS =====
        if (y > 240) { doc.addPage(); y = margen; }
        doc.setTextColor(26, 26, 46);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('📊 Resumen del periodo', margen, y); y += 7;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`Periodo: últimos ${mesesAtras} meses`, margen, y); y += 5;
        doc.text(`Total de eventos: ${stats.totalEventos}`, margen, y); y += 5;
        doc.text(`Síntomas registrados: ${stats.sintomas}`, margen, y); y += 5;
        doc.text(`Consultas/Controles: ${stats.consultas}`, margen, y); y += 5;
        doc.text(`Medicamentos registrados: ${stats.medicamentosTotal}`, margen, y); y += 5;
        doc.text(`Promedio de eventos por mes: ${stats.promedioMensual}`, margen, y); y += 8;

        // ===== HISTORIAL =====
        if (datos.eventos.length > 0) {
            if (y > 240) { doc.addPage(); y = margen; }
            doc.setTextColor(26, 26, 46);
            doc.setFontSize(13);
            doc.setFont(undefined, 'bold');
            doc.text('📋 Historial de eventos', margen, y); y += 7;

            const eventosOrdenados = [...datos.eventos].sort((a, b) => b.fecha.localeCompare(a.fecha));

            for (const evt of eventosOrdenados) {
                if (y > 270) { doc.addPage(); y = margen; }

                const def = CAMPOS_POR_TIPO[evt.tipo] || {};
                const emoji = def.emoji || '📌';
                const tipoLabel = def.etiqueta || evt.tipo;

                doc.setFont(undefined, 'bold');
                doc.setFontSize(11);
                doc.setTextColor(26, 26, 46);
                doc.text(`${emoji} ${evt.titulo}`, margen, y);

                doc.setFont(undefined, 'normal');
                doc.setFontSize(9);
                doc.setTextColor(107, 114, 128);
                const fechaTxt = formatearFechaCorta(evt.fecha);
                doc.text(fechaTxt, ancho - margen - 25, y);
                y += 5;

                doc.setFontSize(9);
                let metaTxt = tipoLabel;
                if (evt.miembros?.apodo && !miembro) metaTxt += ` · ${evt.miembros.apodo}`;
                if (evt.severidad) {
                    const sevMap = { leve: 'Leve', moderado: 'Moderado', severo: 'Severo' };
                    metaTxt += ` · ${sevMap[evt.severidad]}`;
                }
                doc.text(metaTxt, margen, y); y += 4;

                if (evt.descripcion) {
                    doc.setTextColor(60, 60, 60);
                    const lineas = doc.splitTextToSize(evt.descripcion, ancho - margen * 2);
                    doc.text(lineas, margen, y);
                    y += lineas.length * 4;
                }

                // Detalles de consulta si los hay
                const consultaDetalle = datos.consultas.find(c => c.evento_id === evt.id);
                if (consultaDetalle) {
                    doc.setTextColor(107, 114, 128);
                    if (consultaDetalle.medico_nombre) { doc.text(`Médico: ${consultaDetalle.medico_nombre}`, margen + 2, y); y += 4; }
                    if (consultaDetalle.especialidad) { doc.text(`Especialidad: ${consultaDetalle.especialidad}`, margen + 2, y); y += 4; }
                    if (consultaDetalle.centro_medico) { doc.text(`Centro: ${consultaDetalle.centro_medico}`, margen + 2, y); y += 4; }
                    if (consultaDetalle.diagnostico) {
                        const lineas = doc.splitTextToSize(`Diagnóstico: ${consultaDetalle.diagnostico}`, ancho - margen * 2 - 4);
                        doc.text(lineas, margen + 2, y);
                        y += lineas.length * 4;
                    }
                    if (consultaDetalle.indicaciones) {
                        const lineas = doc.splitTextToSize(`Indicaciones: ${consultaDetalle.indicaciones}`, ancho - margen * 2 - 4);
                        doc.text(lineas, margen + 2, y);
                        y += lineas.length * 4;
                    }
                }

                y += 4;
                doc.setDrawColor(229, 231, 235);
                doc.line(margen, y - 1, ancho - margen, y - 1);
                y += 2;
            }
        }

        // ===== FOTOS (opcional) =====
        if (incluirFotos) {
            const eventosIds = datos.eventos.map(e => e.id);
            if (eventosIds.length > 0) {
                const { data: docs } = await sb
                    .from('documentos')
                    .select('*')
                    .in('evento_id', eventosIds);

                const fotos = (docs || []).filter(d => d.mime_type && d.mime_type.startsWith('image/'));

                if (fotos.length > 0) {
                    doc.addPage();
                    y = margen;
                    doc.setTextColor(26, 26, 46);
                    doc.setFontSize(13);
                    doc.setFont(undefined, 'bold');
                    doc.text('📷 Documentos adjuntos', margen, y); y += 8;

                    for (const foto of fotos) {
                        if (y > 230) { doc.addPage(); y = margen; }
                        try {
                            const url = await obtenerUrlFirmada(foto.ruta_storage, 600);
                            if (!url) continue;

                            const img = await cargarImagenComoBase64(url);
                            const imgAncho = 80;
                            const imgAlto = 60;

                            doc.setFontSize(9);
                            doc.setFont(undefined, 'bold');
                            doc.setTextColor(155, 93, 229);
                            const tipoInfo = TIPOS_DOCUMENTO[foto.tipo] || TIPOS_DOCUMENTO.otro;
                            doc.text(`${tipoInfo.emoji} ${tipoInfo.label}`, margen, y); y += 5;
                            doc.setFont(undefined, 'normal');
                            doc.setTextColor(107, 114, 128);
                            doc.text(foto.nombre_archivo, margen, y); y += 4;

                            doc.addImage(img, 'JPEG', margen, y, imgAncho, imgAlto);
                            y += imgAlto + 8;
                        } catch (err) {
                            console.warn('Error agregando imagen al PDF:', err);
                        }
                    }
                }
            }
        }

        // ===== PIE DE PÁGINA =====
        const totalPaginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${totalPaginas}`, ancho - margen - 20, alto - 8);
            doc.text('🐷 Salud Marrana - Bitácora familiar', margen, alto - 8);
        }

        // Descargar
        const nombreMiembro = miembro ? miembro.apodo.toLowerCase() : 'familia';
        const fechaArchivo = new Date().toISOString().split('T')[0];
        doc.save(`salud-marrana-${nombreMiembro}-${fechaArchivo}.pdf`);

        mostrarToast('PDF generado ✅', 'exito');
    } catch (err) {
        console.error('Error generando PDF:', err);
        mostrarToast('Error generando PDF: ' + err.message, 'error');
    }
}

// Helper: convertir imagen URL a base64 para jsPDF
async function cargarImagenComoBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// =====================================================
// MODAL DE EXPORTAR PDF
// =====================================================
window.abrirModalExportar = function(miembroPreseleccionado = null) {
    const modal = document.createElement('div');
    modal.className = 'voz-modal visible';
    modal.id = 'modal-exportar';
    modal.innerHTML = `
        <div class="voz-modal-content" style="max-width: 460px;">
            <div class="voz-modal-header">
                <h3>📄 Exportar reporte para médico</h3>
                <button class="voz-cerrar" onclick="cerrarModalExportar()">✕</button>
            </div>
            <div class="voz-modal-body">
                <div class="form-group">
                    <label>Para quién</label>
                    <select id="exp-miembro" class="form-input">
                        <option value="">Toda la familia</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Periodo</label>
                    <select id="exp-meses" class="form-input">
                        <option value="1">Último mes</option>
                        <option value="3">Últimos 3 meses</option>
                        <option value="6" selected>Últimos 6 meses</option>
                        <option value="12">Último año</option>
                        <option value="24">Últimos 2 años</option>
                        <option value="60">Últimos 5 años</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="exp-fotos">
                        <span>📷 Incluir fotos de documentos</span>
                    </label>
                    <small style="color: var(--texto-secundario); font-size: 12px; display: block; margin-top: 4px;">
                        Recomendado solo si vas a entregar el PDF al médico. Hace el archivo más pesado.
                    </small>
                </div>
            </div>
            <div class="voz-modal-footer">
                <button class="btn-primary" onclick="ejecutarExportar()">
                    📄 Generar PDF
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Cargar miembros
    cargarMiembrosSimple().then(miembros => {
        const select = document.getElementById('exp-miembro');
        miembros.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.emoji} ${m.apodo}`;
            if (m.id === miembroPreseleccionado) opt.selected = true;
            select.appendChild(opt);
        });
    });
};

window.cerrarModalExportar = function() {
    const modal = document.getElementById('modal-exportar');
    if (modal) modal.remove();
};

window.ejecutarExportar = async function() {
    const miembroId = document.getElementById('exp-miembro').value || null;
    const meses = parseInt(document.getElementById('exp-meses').value);
    const fotos = document.getElementById('exp-fotos').checked;

    cerrarModalExportar();
    await exportarPDF({ miembroId, mesesAtras: meses, incluirFotos: fotos });
};

// Helper para cargar miembros (compartido)
async function cargarMiembrosSimple() {
    const { data } = await sb
        .from('miembros')
        .select('id, apodo, color_hex, emoji')
        .order('fecha_nacimiento', { ascending: true });
    return data || [];
}
