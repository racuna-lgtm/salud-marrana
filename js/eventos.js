// =====================================================
// SALUD MARRANA - Registro de eventos (FINAL Paso 4)
// =====================================================

const ESPECIALIDADES = [
    'Pediatría', 'Medicina general', 'Medicina interna', 'Dermatología',
    'Ginecología', 'Reumatología', 'Traumatología', 'Oftalmología',
    'Otorrinolaringología', 'Cardiología', 'Endocrinología', 'Neurología',
    'Psiquiatría', 'Psicología', 'Nutricionista', 'Odontología',
    'Kinesiología', 'Fonoaudiología', 'Urología', 'Gastroenterología', 'Otra'
];

const CENTROS_MEDICOS = [
    'CLC Chicureo', 'CLC Estoril', 'Clínica Las Condes (otra sede)',
    'Clínica Santa María Providencia', 'Clínica Santa María La Dehesa',
    'Integramédica', 'RedSalud', 'Indisa', 'Vidaintegra',
    'Hospital público', 'Consulta particular', 'Otro'
];

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
        camposExtra: ['medico_nombre', 'especialidad', 'centro_medico', 'diagnostico', 'indicaciones', 'proximo_control'],
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
        camposExtra: ['MEDICAMENTO_FULL'],
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
        camposExtra: ['centro_medico', 'diagnostico', 'fecha_alta'],
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
        camposExtra: ['medico_nombre', 'centro_medico', 'estado_mental'],
        sugerenciasTitulo: ['Sesión psicología', 'Crisis ansiedad', 'Estado ánimo', 'Estrés', 'Control psiquiatra']
    }
};

async function cargarMiembrosParaSelector() {
    const { data, error } = await sb
        .from('miembros')
        .select('id, apodo, color_hex, emoji, fecha_nacimiento')
        .order('fecha_nacimiento', { ascending: true });
    return error ? [] : data;
}

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

const formState = {
    miembroId: null,
    tipo: null,
    miembros: [],
    eventoIdEditando: null
};

window.seleccionarTipo = function(tipo) {
    formState.tipo = tipo;
    document.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('seleccionado'));
    document.querySelector(`.tipo-card[data-tipo="${tipo}"]`).classList.add('seleccionado');

    renderizarFormularioCampos(tipo);
    document.getElementById('paso-3').style.display = 'block';
    document.getElementById('paso-3').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.seleccionarMiembro = function(id) {
    formState.miembroId = id;
    document.querySelectorAll('.miembro-chip').forEach(c => c.classList.remove('seleccionado'));
    document.querySelector(`.miembro-chip[data-id="${id}"]`).classList.add('seleccionado');

    document.getElementById('paso-2').style.display = 'block';
    document.getElementById('paso-2').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function selectEspecialidades(idCampo = 'evt-especialidad') {
    let html = `<select id="${idCampo}" class="form-input" onchange="toggleSelectOtra(this, '${idCampo}-otra')">`;
    html += '<option value="">Seleccionar...</option>';
    ESPECIALIDADES.forEach(e => {
        html += `<option value="${e}">${e}</option>`;
    });
    html += '</select>';
    html += `<input type="text" id="${idCampo}-otra" class="form-input" placeholder="Especifica la especialidad" style="display: none; margin-top: 8px;">`;
    return html;
}

function selectCentrosMedicos(idCampo = 'evt-centro') {
    let html = `<select id="${idCampo}" class="form-input" onchange="toggleSelectOtra(this, '${idCampo}-otra')">`;
    html += '<option value="">Seleccionar...</option>';
    CENTROS_MEDICOS.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });
    html += '</select>';
    html += `<input type="text" id="${idCampo}-otra" class="form-input" placeholder="Especifica el centro médico" style="display: none; margin-top: 8px;">`;
    return html;
}

window.toggleSelectOtra = function(selectEl, otraId) {
    const otraEl = document.getElementById(otraId);
    if (selectEl.value === 'Otra' || selectEl.value === 'Otro') {
        otraEl.style.display = 'block';
        otraEl.focus();
    } else {
        otraEl.style.display = 'none';
        otraEl.value = '';
    }
};

window.toggleEspecialidadOtra = window.toggleSelectOtra;

function renderizarFormularioCampos(tipo) {
    const def = CAMPOS_POR_TIPO[tipo];
    const cont = document.getElementById('campos-extra');
    const hoy = new Date().toISOString().split('T')[0];
    const esMedicamento = tipo === 'medicamento';

    const datalistId = 'sugerencias-titulo';
    const datalist = `
        <datalist id="${datalistId}">
            ${def.sugerenciasTitulo.map(s => `<option value="${s}">`).join('')}
        </datalist>
    `;

    let html = datalist;

    if (!esMedicamento) {
        html += `
            <div class="form-group">
                <label for="evt-titulo">Título *</label>
                <input type="text" id="evt-titulo" class="form-input" list="${datalistId}" placeholder="Ej: ${def.sugerenciasTitulo[0]}" required>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label for="evt-fecha">Fecha *</label>
                    <input type="date" id="evt-fecha" class="form-input" value="${hoy}" max="${hoy}" required>
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
    }

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

    if (campos.includes('estado_mental')) {
        html += `
            <div class="form-group">
                <label>Estado general</label>
                <div class="severidad-opciones">
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="leve" checked><span>🟢 Estable</span></label>
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="moderado"><span>🟡 Inquieto</span></label>
                    <label class="severidad-opcion"><input type="radio" name="severidad" value="severo"><span>🔴 Crítico</span></label>
                </div>
            </div>
        `;
    }

    if (campos.includes('medico_nombre')) {
        html += `<div class="form-group"><label for="evt-medico">Médico/profesional</label><input type="text" id="evt-medico" class="form-input" placeholder="Dr/a. Nombre Apellido"></div>`;
    }

    if (campos.includes('especialidad')) {
        html += `<div class="form-group"><label for="evt-especialidad">Especialidad</label>${selectEspecialidades('evt-especialidad')}</div>`;
    }

    if (campos.includes('centro_medico')) {
        html += `<div class="form-group"><label for="evt-centro">Centro médico</label>${selectCentrosMedicos('evt-centro')}</div>`;
    }

    if (campos.includes('diagnostico')) {
        html += `<div class="form-group"><label for="evt-diagnostico">Diagnóstico</label><textarea id="evt-diagnostico" class="form-input form-textarea" rows="2"></textarea></div>`;
    }

    if (campos.includes('indicaciones')) {
        html += `<div class="form-group"><label for="evt-indicaciones">Indicaciones</label><textarea id="evt-indicaciones" class="form-input form-textarea" rows="2"></textarea></div>`;
    }

    if (campos.includes('proximo_control')) {
        html += `<div class="form-group"><label for="evt-proximo">Próximo control (opcional)</label><input type="date" id="evt-proximo" class="form-input" min="${hoy}"><small style="color: var(--texto-secundario); font-size: 12px;">Si lo agregas, se crea un recordatorio automático</small></div>`;
    }

    if (campos.includes('fecha_alta')) {
        html += `<div class="form-group"><label for="evt-fecha-alta">Fecha de alta (opcional)</label><input type="date" id="evt-fecha-alta" class="form-input" max="${hoy}"></div>`;
    }

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

    if (campos.includes('MEDICAMENTO_FULL')) {
        html += `
            <div class="form-group">
                <label for="med-nombre">Nombre del medicamento *</label>
                <input type="text" id="med-nombre" class="form-input" list="${datalistId}" placeholder="Ej: Loratadina" required>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label for="med-dosis">Dosis</label><input type="text" id="med-dosis" class="form-input" placeholder="500mg"></div>
                <div class="form-group"><label for="med-frecuencia">Frecuencia</label><input type="text" id="med-frecuencia" class="form-input" placeholder="cada 8h"></div>
            </div>
            <div class="form-group"><label for="med-via">Vía</label><select id="med-via" class="form-input"><option value="">Seleccionar</option><option>Oral</option><option>Tópica</option><option>Intramuscular</option><option>Inhalada</option><option>Subcutánea</option><option>Otra</option></select></div>
            <div class="form-group">
                <label>Tipo de uso *</label>
                <div class="severidad-opciones">
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="puntual" onchange="actualizarCamposMedicamento()" checked><span>💊 Puntual</span></label>
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="regular" onchange="actualizarCamposMedicamento()"><span>🔄 Regular/Crónico</span></label>
                    <label class="severidad-opcion"><input type="radio" name="med-tipo" value="asociado_enfermedad" onchange="actualizarCamposMedicamento()"><span>🤒 Por enfermedad</span></label>
                </div>
                <small id="med-tipo-ayuda" style="color: var(--texto-secundario); font-size: 12px; display: block; margin-top: 8px;">
                    💊 <b>Puntual</b>: una sola toma específica
                </small>
            </div>
            <div id="med-fechas-container"></div>
            <div class="form-group"><label for="med-motivo">Motivo</label><input type="text" id="med-motivo" class="form-input" placeholder="Ej: Rinitis crónica"></div>
            <div class="form-group"><label for="med-recetado-por">Recetado por (opcional)</label><input type="text" id="med-recetado-por" class="form-input"></div>
            <div class="form-group">
                <label for="med-descripcion">Notas (opcional)</label>
                <textarea id="med-descripcion" class="form-input form-textarea" placeholder="Detalle adicional" rows="2"></textarea>
            </div>
        `;
    }

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

    html += `
        <div class="acordeon">
            <button type="button" class="acordeon-trigger" onclick="this.parentElement.classList.toggle('abierto')">
                <span>⚙️ Más opciones</span>
                <span class="acordeon-icono">▼</span>
            </button>
            <div class="acordeon-contenido">
                <div class="form-group">
                    <label for="evt-tags">Etiquetas</label>
                    <input type="text" id="evt-tags" class="form-input" placeholder="Ej: invierno, colegio (separadas por coma)">
                    <small style="color: var(--texto-secundario); font-size: 12px;">Útiles para filtrar después</small>
                </div>
            </div>
        </div>
    `;

    if (typeof htmlUploaderDocs === 'function') {
        html += htmlUploaderDocs();
    }

    cont.innerHTML = html;

    if (tipo === 'medicamento') {
        actualizarCamposMedicamento();
    }
}

window.actualizarCamposMedicamento = function() {
    const container = document.getElementById('med-fechas-container');
    const ayudaEl = document.getElementById('med-tipo-ayuda');
    if (!container) return;

    const hoy = new Date().toISOString().split('T')[0];
    const tipoEl = document.querySelector('input[name="med-tipo"]:checked');
    const tipo = tipoEl ? tipoEl.value : 'puntual';

    let html = '';
    let ayuda = '';

    if (tipo === 'puntual') {
        html = `
            <div class="form-group">
                <label for="med-fecha-inicio">Fecha de la toma *</label>
                <input type="date" id="med-fecha-inicio" class="form-input" value="${hoy}" max="${hoy}" required>
            </div>
        `;
        ayuda = '💊 <b>Puntual</b>: una sola toma específica (ej: paracetamol hoy)';
    } else if (tipo === 'regular') {
        html = `
            <div class="form-group">
                <label for="med-fecha-inicio">Tomándolo desde *</label>
                <input type="date" id="med-fecha-inicio" class="form-input" value="${hoy}" max="${hoy}" required>
                <small style="color: var(--texto-secundario); font-size: 12px;">Si no recuerdas la fecha exacta, deja la de hoy</small>
            </div>
        `;
        ayuda = '🔄 <b>Regular/Crónico</b>: tratamiento indefinido. Sin fecha de fin — lo finalizas manualmente cuando termine';
    } else if (tipo === 'asociado_enfermedad') {
        html = `
            <div class="form-grid-2">
                <div class="form-group">
                    <label for="med-fecha-inicio">Inicio *</label>
                    <input type="date" id="med-fecha-inicio" class="form-input" value="${hoy}" required>
                </div>
                <div class="form-group">
                    <label for="med-fecha-fin">Fin *</label>
                    <input type="date" id="med-fecha-fin" class="form-input" required>
                </div>
            </div>
        `;
        ayuda = '🤒 <b>Por enfermedad</b>: tratamiento con duración definida (ej: antibiótico por 7 días)';
    }

    container.innerHTML = html;
    if (ayudaEl) ayudaEl.innerHTML = ayuda;
};

function leerCampoConOtra(idCampo) {
    const select = document.getElementById(idCampo);
    if (!select) return null;
    const valor = select.value;
    if (valor === 'Otra' || valor === 'Otro') {
        const otra = document.getElementById(idCampo + '-otra');
        return otra?.value.trim() || null;
    }
    return valor || null;
}

function leerEspecialidad(idCampo = 'evt-especialidad') {
    return leerCampoConOtra(idCampo);
}

function validarFechas(tipo) {
    if (tipo === 'medicamento') {
        const tipoMedEl = document.querySelector('input[name="med-tipo"]:checked');
        const tipoMed = tipoMedEl ? tipoMedEl.value : 'puntual';

        if (tipoMed === 'asociado_enfermedad') {
            const inicio = document.getElementById('med-fecha-inicio')?.value;
            const fin = document.getElementById('med-fecha-fin')?.value;
            if (!fin) return 'Para tratamientos por enfermedad debes indicar fecha de fin';
            if (inicio && fin && fin < inicio) {
                return 'La fecha de fin no puede ser anterior al inicio';
            }
        }
    }
    if (tipo === 'hospitalizacion') {
        const fecha = document.getElementById('evt-fecha')?.value;
        const alta = document.getElementById('evt-fecha-alta')?.value;
        if (fecha && alta && alta < fecha) {
            return 'La fecha de alta no puede ser anterior al ingreso';
        }
    }
    return null;
}

async function guardarEvento() {
    const btn = document.getElementById('btn-guardar');
    const tipo = formState.tipo;
    const miembroId = formState.miembroId;

    if (!miembroId) return mostrarToast('Falta elegir el miembro', 'error');
    if (!tipo) return mostrarToast('Falta elegir el tipo de evento', 'error');

    const errorFechas = validarFechas(tipo);
    if (errorFechas) return mostrarToast(errorFechas, 'error');

    let tituloFinal, fecha, hora, descripcion;

    if (tipo === 'medicamento') {
        const medNombre = document.getElementById('med-nombre')?.value.trim();
        if (!medNombre) return mostrarToast('Falta el nombre del medicamento', 'error');
        tituloFinal = medNombre;
        fecha = document.getElementById('med-fecha-inicio')?.value;
        hora = null;
        descripcion = document.getElementById('med-descripcion')?.value.trim() || null;
    } else {
        tituloFinal = document.getElementById('evt-titulo')?.value.trim();
        fecha = document.getElementById('evt-fecha')?.value;
        hora = document.getElementById('evt-hora')?.value || null;
        descripcion = document.getElementById('evt-descripcion')?.value.trim() || null;
    }

    if (!tituloFinal) return mostrarToast('Falta el título', 'error');
    if (!fecha) return mostrarToast('Falta la fecha', 'error');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
        const tagsInput = document.getElementById('evt-tags')?.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : null;

        const severidadEl = document.querySelector('input[name="severidad"]:checked');

        const eventoData = {
            miembro_id: miembroId,
            tipo,
            fecha,
            hora,
            titulo: tituloFinal,
            descripcion,
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

        const def = CAMPOS_POR_TIPO[tipo];
        const campos = def.camposExtra;

        const tieneConsulta = campos.includes('medico_nombre') || campos.includes('diagnostico') || campos.includes('indicaciones');
        if (tieneConsulta) {
            const consultaData = {
                evento_id: evento.id,
                medico_nombre: document.getElementById('evt-medico')?.value.trim() || null,
                especialidad: leerCampoConOtra('evt-especialidad'),
                centro_medico: leerCampoConOtra('evt-centro'),
                diagnostico: document.getElementById('evt-diagnostico')?.value.trim() || null,
                indicaciones: document.getElementById('evt-indicaciones')?.value.trim() || null,
                proximo_control: document.getElementById('evt-proximo')?.value || null
            };
            await sb.from('consultas_medicas').insert(consultaData);

            if (consultaData.proximo_control) {
                await sb.from('recordatorios').insert({
                    miembro_id: miembroId,
                    titulo: `Control: ${tituloFinal}`,
                    descripcion: consultaData.medico_nombre || '',
                    fecha: consultaData.proximo_control,
                    tipo: 'control'
                });
                mostrarToast(`Recordatorio creado para ${formatearFechaCorta(consultaData.proximo_control)} 📌`, 'exito');
            }
        }

        if (campos.includes('fecha_alta')) {
            const fechaAlta = document.getElementById('evt-fecha-alta')?.value;
            if (fechaAlta) {
                await sb.from('eventos')
                    .update({ descripcion: (descripcion ? descripcion + '\n' : '') + `Alta: ${formatearFechaCorta(fechaAlta)}` })
                    .eq('id', evento.id);
            }
        }

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

        if (campos.includes('MEDICAMENTO_FULL')) {
            const tipoMedEl = document.querySelector('input[name="med-tipo"]:checked');
            const tipoMed = tipoMedEl ? tipoMedEl.value : 'puntual';
            const fechaFinEl = document.getElementById('med-fecha-fin');
            const fechaFin = fechaFinEl ? (fechaFinEl.value || null) : null;
            const hoy = new Date().toISOString().split('T')[0];

            let enCurso = false;
            if (tipoMed === 'regular') {
                enCurso = true;
            } else if (tipoMed === 'asociado_enfermedad') {
                enCurso = fechaFin ? fechaFin >= hoy : true;
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

        if (campos.includes('vac_lugar')) {
            await sb.from('vacunas').insert({
                evento_id: evento.id,
                miembro_id: miembroId,
                nombre: tituloFinal,
                fecha,
                lugar: document.getElementById('vac-lugar')?.value || 'otro'
            });
        }

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

        if (typeof subirDocsPendientes === 'function' && typeof docsPendientes !== 'undefined' && docsPendientes.length > 0) {
            btn.innerHTML = '<span class="spinner"></span> Subiendo documentos...';
            const resultado = await subirDocsPendientes(miembroId, evento.id);
            if (resultado.errores > 0) {
                mostrarToast(`${resultado.exitos} documentos subidos, ${resultado.errores} con error`, 'alerta');
            } else if (resultado.exitos > 0) {
                mostrarToast(`${resultado.exitos} documento${resultado.exitos > 1 ? 's' : ''} subido${resultado.exitos > 1 ? 's' : ''} ✅`, 'exito');
            }
        }

        mostrarToast('Evento registrado ✅', 'exito');

        setTimeout(() => {
            window.location.href = `perfil.html?id=${miembroId}`;
        }, 1200);
    } catch (err) {
        console.error('Error guardando evento:', err);
        mostrarToast('Error al guardar: ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Guardar evento';
    }
}

async function finalizarMedicamento(medicamentoId, miembroId) {
    if (!confirm('¿Marcar este medicamento como finalizado?')) return;

    const hoy = new Date().toISOString().split('T')[0];

    try {
        const { error } = await sb
            .from('medicamentos')
            .update({
                en_curso: false,
                fecha_fin: hoy
            })
            .eq('id', medicamentoId);

        if (error) throw error;

        mostrarToast('Medicamento finalizado ✅', 'exito');
        setTimeout(() => location.reload(), 800);
    } catch (err) {
        console.error(err);
        mostrarToast('Error al finalizar', 'error');
    }
}

async function eliminarEvento(eventoId, miembroId) {
    if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;

    try {
        const { error } = await sb
            .from('eventos')
            .delete()
            .eq('id', eventoId);

        if (error) throw error;

        mostrarToast('Evento eliminado', 'exito');
        setTimeout(() => {
            window.location.href = `perfil.html?id=${miembroId}`;
        }, 800);
    } catch (err) {
        console.error(err);
        mostrarToast('Error al eliminar', 'error');
    }
}
