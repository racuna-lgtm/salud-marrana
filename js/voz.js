// =====================================================
// SALUD MARRANA - Reconocimiento de voz (chileno)
// =====================================================

const VOZ_CONFIG = {
    idioma: 'es-CL',
    interim: true,
    continuo: false
};

// Diccionarios para parser
const DICC_MIEMBROS = {
    'magda': 'Magda', 'magdalena': 'Magda', 'maga': 'Magda',
    'martin': 'Martín', 'martín': 'Martín', 'tincho': 'Martín', 'martincito': 'Martín',
    'naty': 'Naty', 'natalia': 'Naty', 'nati': 'Naty', 'mamá': 'Naty', 'mama': 'Naty',
    'rafa': 'Rafa', 'rafael': 'Rafa', 'papá': 'Rafa', 'papa': 'Rafa'
};

const DICC_TIPOS = {
    sintoma: ['fiebre', 'tos', 'dolor', 'resfrío', 'resfriado', 'resfriada', 'gripe', 'mocos', 'mocoso', 'mocosa', 'amaneció', 'amanecio', 'mareo', 'náusea', 'nausea', 'vómito', 'vomito', 'vomitó', 'vomito', 'diarrea', 'cansado', 'cansada', 'molestia', 'malestar', 'enfermo', 'enferma'],
    consulta_medica: ['consulta', 'médico', 'medico', 'doctor', 'doctora', 'pediatra', 'ginecólogo', 'ginecologo', 'ginecóloga', 'ginecologa', 'dermatólogo', 'dermatologa', 'reumatólogo', 'reumatologa', 'fue al', 'fui al', 'llevé', 'lleve', 'consulta médica'],
    medicamento: ['tomó', 'tomo', 'tomé', 'tome', 'le di', 'pastilla', 'medicamento', 'remedio', 'jarabe', 'paracetamol', 'ibuprofeno', 'antibiótico', 'antibiotico', 'amoxicilina', 'loratadina', 'cetirizina', 'bilastina', 'aspirina'],
    vacuna: ['vacuna', 'vacunó', 'vacuno', 'vacunaron', 'vacunada', 'vacunado', 'inyección', 'inyeccion', 'influenza', 'covid'],
    examen: ['examen', 'exámenes', 'examenes', 'sangre', 'orina', 'radiografía', 'radiografia', 'ecografía', 'ecografia', 'hemograma', 'biopsia', 'resonancia'],
    hospitalizacion: ['hospitalizado', 'hospitalizada', 'urgencia', 'urgencias', 'internado', 'internada', 'hospital'],
    control_preventivo: ['control', 'controlar', 'niño sano', 'preventivo', 'chequeo', 'pap', 'mamografía', 'mamografia'],
    tratamiento_continuo: ['kinesiología', 'kinesiologia', 'kine', 'psicólogo', 'psicologo', 'psicóloga', 'psicologa', 'sesión', 'sesion', 'terapia', 'fonoaudióloga', 'fonoaudiologa', 'nutricionista'],
    procedimiento: ['sutura', 'puntos', 'curación', 'curacion', 'extracción', 'extraccion', 'cirugía', 'cirugia'],
    alergia: ['alergia', 'alérgico', 'alergico', 'alérgica', 'alergica', 'reacción alérgica', 'reaccion alergica'],
    medicion: ['peso', 'pesó', 'peso', 'talla', 'altura', 'midió', 'midio', 'presión', 'presion', 'temperatura', 'imc'],
    salud_mental: ['ansiedad', 'crisis', 'pánico', 'panico', 'depresión', 'depresion', 'estrés', 'estres', 'angustia', 'psiquiatra']
};

const DICC_SEVERIDAD = {
    leve: ['leve', 'leves', 'poco', 'poca', 'suave', 'medio', 'pequeño', 'pequeña', 'apenas', 'un poquito'],
    moderado: ['moderado', 'moderada', 'medio', 'algo', 'normal'],
    severo: ['fuerte', 'intenso', 'intensa', 'mucho', 'mucha', 'severo', 'severa', 'grave', 'muy', 'fortísimo', 'fortisimo', 'horrible', 'terrible']
};

const DICC_CENTROS = {
    'las condes chicureo': 'CLC Chicureo',
    'clc chicureo': 'CLC Chicureo',
    'chicureo': 'CLC Chicureo',
    'las condes estoril': 'CLC Estoril',
    'clc estoril': 'CLC Estoril',
    'estoril': 'CLC Estoril',
    'las condes': 'Clínica Las Condes (otra sede)',
    'santa maría providencia': 'Clínica Santa María Providencia',
    'santa maria providencia': 'Clínica Santa María Providencia',
    'santa maría la dehesa': 'Clínica Santa María La Dehesa',
    'santa maria la dehesa': 'Clínica Santa María La Dehesa',
    'santa maría': 'Clínica Santa María Providencia',
    'santa maria': 'Clínica Santa María Providencia',
    'integramédica': 'Integramédica',
    'integramedica': 'Integramédica',
    'redsalud': 'RedSalud',
    'red salud': 'RedSalud',
    'indisa': 'Indisa',
    'vidaintegra': 'Vidaintegra',
    'vida íntegra': 'Vidaintegra',
    'consulta particular': 'Consulta particular',
    'particular': 'Consulta particular',
    'consultorio': 'Hospital público',
    'hospital': 'Hospital público'
};

const DICC_ESPECIALIDADES = {
    'pediatra': 'Pediatría', 'pediatría': 'Pediatría', 'pediatria': 'Pediatría',
    'general': 'Medicina general', 'general': 'Medicina general',
    'internista': 'Medicina interna', 'medicina interna': 'Medicina interna',
    'dermatólogo': 'Dermatología', 'dermatologo': 'Dermatología', 'dermatóloga': 'Dermatología', 'dermatologa': 'Dermatología', 'dermatología': 'Dermatología', 'dermatologia': 'Dermatología',
    'ginecólogo': 'Ginecología', 'ginecologo': 'Ginecología', 'ginecóloga': 'Ginecología', 'ginecologa': 'Ginecología', 'ginecología': 'Ginecología', 'ginecologia': 'Ginecología',
    'reumatólogo': 'Reumatología', 'reumatologo': 'Reumatología', 'reumatóloga': 'Reumatología', 'reumatologa': 'Reumatología', 'reumatología': 'Reumatología', 'reumatologia': 'Reumatología',
    'traumatólogo': 'Traumatología', 'traumatologo': 'Traumatología', 'traumatología': 'Traumatología', 'traumatologia': 'Traumatología',
    'oftalmólogo': 'Oftalmología', 'oftalmologo': 'Oftalmología', 'oftalmólogo': 'Oftalmología', 'oftalmología': 'Oftalmología', 'oftalmologia': 'Oftalmología',
    'otorrino': 'Otorrinolaringología', 'otorrinolaringólogo': 'Otorrinolaringología', 'otorrino': 'Otorrinolaringología',
    'cardiólogo': 'Cardiología', 'cardiologo': 'Cardiología', 'cardiología': 'Cardiología', 'cardiologia': 'Cardiología',
    'endocrinólogo': 'Endocrinología', 'endocrinologo': 'Endocrinología', 'endocrinología': 'Endocrinología', 'endocrinologia': 'Endocrinología',
    'neurólogo': 'Neurología', 'neurologo': 'Neurología', 'neurología': 'Neurología', 'neurologia': 'Neurología',
    'psiquiatra': 'Psiquiatría', 'psiquiatría': 'Psiquiatría', 'psiquiatria': 'Psiquiatría',
    'psicólogo': 'Psicología', 'psicologo': 'Psicología', 'psicóloga': 'Psicología', 'psicologa': 'Psicología', 'psicología': 'Psicología', 'psicologia': 'Psicología',
    'nutricionista': 'Nutricionista',
    'dentista': 'Odontología', 'odontólogo': 'Odontología', 'odontologo': 'Odontología', 'odontología': 'Odontología', 'odontologia': 'Odontología',
    'kinesiólogo': 'Kinesiología', 'kinesiologo': 'Kinesiología', 'kine': 'Kinesiología', 'kinesiología': 'Kinesiología', 'kinesiologia': 'Kinesiología',
    'fonoaudiólogo': 'Fonoaudiología', 'fonoaudiologo': 'Fonoaudiología', 'fonoaudióloga': 'Fonoaudiología', 'fonoaudiologa': 'Fonoaudiología', 'fonoaudiología': 'Fonoaudiología', 'fonoaudiologia': 'Fonoaudiología',
    'urólogo': 'Urología', 'urologo': 'Urología', 'urología': 'Urología', 'urologia': 'Urología',
    'gastroenterólogo': 'Gastroenterología', 'gastroenterologo': 'Gastroenterología', 'gastroenterología': 'Gastroenterología', 'gastroenterologia': 'Gastroenterología'
};

const DICC_LUGARES_VACUNA = {
    'colegio': 'colegio', 'escuela': 'colegio',
    'farmacia': 'farmacia', 'cruz verde': 'farmacia', 'salcobrand': 'farmacia', 'ahumada': 'farmacia',
    'consultorio': 'consultorio',
    'clínica': 'clinica', 'clinica': 'clinica',
    'cesfam': 'consultorio'
};

// =====================================================
// CHECK COMPATIBILIDAD
// =====================================================
function vozDisponible() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
}

// =====================================================
// PARSER DE TEXTO DICTADO
// =====================================================
function parsearDictado(texto) {
    const original = texto;
    const t = texto.toLowerCase();
    const resultado = {
        textoOriginal: original,
        miembro: null,
        tipo: null,
        titulo: null,
        severidad: null,
        fecha: null,
        centro_medico: null,
        especialidad: null,
        descripcion: original,
        lugar_vacuna: null,
        nombreMedicamento: null,
        confianza: 0
    };

    // 1. Detectar miembro
    for (const [palabra, apodo] of Object.entries(DICC_MIEMBROS)) {
        const regex = new RegExp(`\\b${palabra}\\b`, 'i');
        if (regex.test(t)) {
            resultado.miembro = apodo;
            resultado.confianza += 25;
            break;
        }
    }

    // 2. Detectar tipo (orden importa: medicamento antes de síntoma porque pueden coexistir)
    const ordenTipos = ['medicamento', 'vacuna', 'consulta_medica', 'examen', 'hospitalizacion', 'control_preventivo', 'tratamiento_continuo', 'procedimiento', 'alergia', 'medicion', 'salud_mental', 'sintoma'];
    for (const tipo of ordenTipos) {
        const palabras = DICC_TIPOS[tipo];
        for (const p of palabras) {
            if (t.includes(p)) {
                resultado.tipo = tipo;
                resultado.confianza += 25;
                break;
            }
        }
        if (resultado.tipo) break;
    }

    // 3. Detectar severidad
    for (const [nivel, palabras] of Object.entries(DICC_SEVERIDAD)) {
        for (const p of palabras) {
            const regex = new RegExp(`\\b${p}\\b`, 'i');
            if (regex.test(t)) {
                resultado.severidad = nivel;
                break;
            }
        }
        if (resultado.severidad) break;
    }
    if (!resultado.severidad && resultado.tipo === 'sintoma') {
        resultado.severidad = 'leve';
    }

    // 4. Detectar fecha
    const hoy = new Date();
    if (/\bayer\b/i.test(t)) {
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        resultado.fecha = ayer.toISOString().split('T')[0];
    } else if (/\bantes de ayer\b|\banteayer\b/i.test(t)) {
        const ant = new Date(hoy);
        ant.setDate(hoy.getDate() - 2);
        resultado.fecha = ant.toISOString().split('T')[0];
    } else if (/\bhoy\b/i.test(t) || true) {
        resultado.fecha = hoy.toISOString().split('T')[0];
    }

    // 5. Detectar centro médico
    for (const [palabra, centro] of Object.entries(DICC_CENTROS)) {
        if (t.includes(palabra)) {
            resultado.centro_medico = centro;
            resultado.confianza += 10;
            break;
        }
    }

    // 6. Detectar especialidad
    for (const [palabra, esp] of Object.entries(DICC_ESPECIALIDADES)) {
        const regex = new RegExp(`\\b${palabra}\\b`, 'i');
        if (regex.test(t)) {
            resultado.especialidad = esp;
            resultado.confianza += 10;
            break;
        }
    }

    // 7. Detectar lugar de vacuna
    if (resultado.tipo === 'vacuna') {
        for (const [palabra, lugar] of Object.entries(DICC_LUGARES_VACUNA)) {
            if (t.includes(palabra)) {
                resultado.lugar_vacuna = lugar;
                break;
            }
        }
    }

    // 8. Detectar nombre de medicamento (heurística simple)
    if (resultado.tipo === 'medicamento') {
        const medsConocidos = ['paracetamol', 'ibuprofeno', 'amoxicilina', 'loratadina', 'cetirizina', 'bilastina', 'aspirina', 'omeprazol', 'metformina', 'clonazepam', 'sertralina', 'fluoxetina', 'antibiótico', 'antibiotico'];
        for (const med of medsConocidos) {
            const regex = new RegExp(`\\b${med}\\b`, 'i');
            if (regex.test(t)) {
                resultado.nombreMedicamento = med.charAt(0).toUpperCase() + med.slice(1);
                resultado.confianza += 15;
                break;
            }
        }
    }

    // 9. Generar título sugerido
    if (resultado.tipo === 'sintoma') {
        const sintomas = [];
        if (/\btos\b/i.test(t)) sintomas.push('Tos');
        if (/\bfiebre\b/i.test(t)) sintomas.push('Fiebre');
        if (/\bdolor de cabeza\b/i.test(t)) sintomas.push('Dolor de cabeza');
        if (/\bdolor de estómago\b|\bdolor de estomago\b|\bguatita\b/i.test(t)) sintomas.push('Dolor de estómago');
        if (/\bdolor de garganta\b/i.test(t)) sintomas.push('Dolor de garganta');
        if (/\bresfrío\b|\bresfrio\b|\bresfriado\b|\bresfriada\b/i.test(t)) sintomas.push('Resfrío');
        if (/\bvómito\b|\bvomito\b/i.test(t)) sintomas.push('Vómitos');
        if (/\bdiarrea\b/i.test(t)) sintomas.push('Diarrea');
        if (/\bmareo\b/i.test(t)) sintomas.push('Mareo');
        resultado.titulo = sintomas.length > 0 ? sintomas.join(' y ') : 'Síntoma';
    } else if (resultado.tipo === 'medicamento') {
        resultado.titulo = resultado.nombreMedicamento || 'Medicamento';
    } else if (resultado.tipo === 'consulta_medica') {
        resultado.titulo = resultado.especialidad ? `Consulta ${resultado.especialidad}` : 'Consulta médica';
    } else if (resultado.tipo === 'vacuna') {
        if (/\binfluenza\b/i.test(t)) resultado.titulo = 'Influenza';
        else if (/\bcovid\b/i.test(t)) resultado.titulo = 'COVID-19';
        else if (/\bvph\b/i.test(t)) resultado.titulo = 'VPH';
        else resultado.titulo = 'Vacuna';
    } else if (resultado.tipo === 'examen') {
        if (/\bsangre\b/i.test(t)) resultado.titulo = 'Examen de sangre';
        else if (/\borina\b/i.test(t)) resultado.titulo = 'Examen de orina';
        else if (/\bradiografía\b|\bradiografia\b/i.test(t)) resultado.titulo = 'Radiografía';
        else if (/\becografía\b|\becografia\b/i.test(t)) resultado.titulo = 'Ecografía';
        else if (/\bhemograma\b/i.test(t)) resultado.titulo = 'Hemograma';
        else resultado.titulo = 'Examen';
    } else if (resultado.tipo === 'control_preventivo') {
        resultado.titulo = 'Control preventivo';
    } else {
        resultado.titulo = resultado.tipo ? CAMPOS_POR_TIPO[resultado.tipo]?.etiqueta || 'Evento' : 'Evento';
    }

    return resultado;
}

// =====================================================
// MOTOR DE RECONOCIMIENTO
// =====================================================
class ReconocedorVoz {
    constructor() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            this.disponible = false;
            return;
        }
        this.disponible = true;
        this.reconocedor = new SR();
        this.reconocedor.lang = VOZ_CONFIG.idioma;
        this.reconocedor.interimResults = VOZ_CONFIG.interim;
        this.reconocedor.continuous = VOZ_CONFIG.continuo;
        this.escuchando = false;
        this.textoFinal = '';
    }

    iniciar(callbacks) {
        if (!this.disponible) {
            callbacks.onError?.('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        if (this.escuchando) return;

        this.textoFinal = '';

        this.reconocedor.onstart = () => {
            this.escuchando = true;
            callbacks.onStart?.();
        };

        this.reconocedor.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.textoFinal += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            callbacks.onResult?.(this.textoFinal.trim(), interim);
        };

        this.reconocedor.onerror = (event) => {
            this.escuchando = false;
            let mensaje = 'Error de reconocimiento';
            if (event.error === 'no-speech') mensaje = 'No detecté nada. Intenta de nuevo';
            else if (event.error === 'not-allowed') mensaje = 'Tienes que dar permiso al micrófono';
            else if (event.error === 'audio-capture') mensaje = 'No detecto micrófono';
            else if (event.error === 'network') mensaje = 'Sin conexión a internet';
            callbacks.onError?.(mensaje);
        };

        this.reconocedor.onend = () => {
            this.escuchando = false;
            callbacks.onEnd?.(this.textoFinal.trim());
        };

        try {
            this.reconocedor.start();
        } catch (err) {
            callbacks.onError?.('Error iniciando reconocimiento');
        }
    }

    detener() {
        if (this.escuchando && this.reconocedor) {
            this.reconocedor.stop();
        }
    }
}

// =====================================================
// MODAL DE VOZ
// =====================================================
function abrirModalVoz() {
    if (!vozDisponible()) {
        mostrarToast('Tu navegador no soporta voz. Usa Chrome o Safari', 'error');
        return;
    }

    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'voz-modal';
    modal.innerHTML = `
        <div class="voz-modal-content">
            <div class="voz-modal-header">
                <h3>🎤 Registro por voz</h3>
                <button class="voz-cerrar" onclick="cerrarModalVoz()">✕</button>
            </div>

            <div class="voz-modal-body">
                <div id="voz-estado" class="voz-estado-inicial">
                    <p style="margin-bottom: 16px;">Toca el botón y dime qué pasó. Por ejemplo:</p>
                    <div class="voz-ejemplos">
                        <em>"Magda amaneció con tos y un poco de fiebre"</em>
                        <em>"Le di paracetamol a Martín por dolor de cabeza"</em>
                        <em>"Naty fue al ginecólogo en CLC Estoril"</em>
                    </div>
                </div>

                <div id="voz-transcripcion" class="voz-transcripcion" style="display: none;"></div>

                <div id="voz-resultado" class="voz-resultado" style="display: none;"></div>
            </div>

            <div class="voz-modal-footer">
                <button id="btn-grabar" class="btn-mic" onclick="toggleGrabacion()">
                    <span class="btn-mic-icono">🎤</span>
                    <span class="btn-mic-texto">Tocar para hablar</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('visible'), 10);
}

window.cerrarModalVoz = function() {
    const modal = document.querySelector('.voz-modal');
    if (modal) {
        if (window._reconocedorActual?.escuchando) {
            window._reconocedorActual.detener();
        }
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 200);
    }
};

window.toggleGrabacion = function() {
    if (!window._reconocedorActual) {
        window._reconocedorActual = new ReconocedorVoz();
    }

    const reconocedor = window._reconocedorActual;
    const btn = document.getElementById('btn-grabar');
    const icono = btn.querySelector('.btn-mic-icono');
    const texto = btn.querySelector('.btn-mic-texto');
    const estadoEl = document.getElementById('voz-estado');
    const transEl = document.getElementById('voz-transcripcion');
    const resultEl = document.getElementById('voz-resultado');

    if (reconocedor.escuchando) {
        reconocedor.detener();
        return;
    }

    reconocedor.iniciar({
        onStart: () => {
            btn.classList.add('grabando');
            icono.textContent = '🔴';
            texto.textContent = 'Escuchando... (toca para parar)';
            estadoEl.style.display = 'none';
            transEl.style.display = 'block';
            transEl.innerHTML = '<em style="color: var(--texto-secundario);">Habla ahora...</em>';
            resultEl.style.display = 'none';
        },
        onResult: (final, interim) => {
            transEl.innerHTML = `
                <div class="voz-texto-final">${final}</div>
                <div class="voz-texto-interim">${interim}</div>
            `;
        },
        onEnd: (textoFinal) => {
            btn.classList.remove('grabando');
            icono.textContent = '🎤';
            texto.textContent = 'Tocar para hablar de nuevo';

            if (!textoFinal) {
                mostrarToast('No detecté nada, intenta de nuevo', 'alerta');
                return;
            }

            // Procesar y mostrar resultado
            procesarYMostrarResultado(textoFinal);
        },
        onError: (mensaje) => {
            btn.classList.remove('grabando');
            icono.textContent = '🎤';
            texto.textContent = 'Tocar para hablar';
            mostrarToast(mensaje, 'error');
        }
    });
};

function procesarYMostrarResultado(texto) {
    const parsed = parsearDictado(texto);
    const resultEl = document.getElementById('voz-resultado');

    let html = `
        <div class="voz-resultado-card">
            <h4>Esto es lo que entendí:</h4>
            <div class="voz-detectado">
    `;

    if (parsed.miembro) {
        html += `<div class="voz-chip">👤 <b>${parsed.miembro}</b></div>`;
    } else {
        html += `<div class="voz-chip voz-chip-falta">👤 ¿Para quién?</div>`;
    }

    if (parsed.tipo) {
        const def = CAMPOS_POR_TIPO[parsed.tipo];
        html += `<div class="voz-chip">${def.emoji} <b>${def.etiqueta}</b></div>`;
    } else {
        html += `<div class="voz-chip voz-chip-falta">📝 ¿Qué tipo?</div>`;
    }

    if (parsed.titulo) {
        html += `<div class="voz-chip">📌 ${parsed.titulo}</div>`;
    }

    if (parsed.severidad) {
        const sevMap = { leve: '🟢 Leve', moderado: '🟡 Moderado', severo: '🔴 Severo' };
        html += `<div class="voz-chip">${sevMap[parsed.severidad]}</div>`;
    }

    if (parsed.especialidad) {
        html += `<div class="voz-chip">🩺 ${parsed.especialidad}</div>`;
    }

    if (parsed.centro_medico) {
        html += `<div class="voz-chip">🏥 ${parsed.centro_medico}</div>`;
    }

    if (parsed.nombreMedicamento) {
        html += `<div class="voz-chip">💊 ${parsed.nombreMedicamento}</div>`;
    }

    html += `
            </div>
            <p class="voz-revisar">Revisa y completa los detalles en el formulario.</p>
            <button class="btn-primary" onclick="aplicarDictadoYAbrir()" style="margin-top: 12px;">
                Continuar al formulario →
            </button>
        </div>
    `;

    resultEl.innerHTML = html;
    resultEl.style.display = 'block';

    // Guardar resultado para usar al continuar
    window._dictadoActual = parsed;
}

// Aplicar el dictado: navegar a nuevo-evento.html con datos en sessionStorage
window.aplicarDictadoYAbrir = function() {
    if (!window._dictadoActual) return;

    sessionStorage.setItem('voz_dictado', JSON.stringify(window._dictadoActual));
    cerrarModalVoz();

    // Si ya estamos en nuevo-evento, aplicar directamente
    if (window.location.pathname.endsWith('nuevo-evento.html')) {
        aplicarDictadoEnFormulario(window._dictadoActual);
    } else {
        window.location.href = 'nuevo-evento.html?desde=voz';
    }
};

// Aplicar valores del dictado al formulario
async function aplicarDictadoEnFormulario(dictado) {
    if (!dictado) return;

    // 1. Seleccionar miembro
    if (dictado.miembro && formState.miembros) {
        const miembro = formState.miembros.find(m => m.apodo === dictado.miembro);
        if (miembro) {
            seleccionarMiembro(miembro.id);
            await new Promise(r => setTimeout(r, 200));
        }
    }

    // 2. Seleccionar tipo
    if (dictado.tipo) {
        seleccionarTipo(dictado.tipo);
        await new Promise(r => setTimeout(r, 300));
    }

    // 3. Llenar campos
    setTimeout(() => {
        if (dictado.tipo === 'medicamento' && dictado.nombreMedicamento) {
            const medNombreEl = document.getElementById('med-nombre');
            if (medNombreEl) medNombreEl.value = dictado.nombreMedicamento;
        } else if (dictado.titulo) {
            const tituloEl = document.getElementById('evt-titulo');
            if (tituloEl) tituloEl.value = dictado.titulo;
        }

        if (dictado.fecha) {
            const fechaEl = document.getElementById('evt-fecha') || document.getElementById('med-fecha-inicio');
            if (fechaEl) fechaEl.value = dictado.fecha;
        }

        if (dictado.descripcion) {
            const descEl = document.getElementById('evt-descripcion') || document.getElementById('med-descripcion');
            if (descEl) descEl.value = dictado.descripcion;
        }

        if (dictado.severidad) {
            const sevEl = document.querySelector(`input[name="severidad"][value="${dictado.severidad}"]`);
            if (sevEl) sevEl.checked = true;
        }

        if (dictado.especialidad) {
            const espEl = document.getElementById('evt-especialidad');
            if (espEl) {
                espEl.value = dictado.especialidad;
                if (espEl.value !== dictado.especialidad) {
                    espEl.value = 'Otra';
                    const otraEl = document.getElementById('evt-especialidad-otra');
                    if (otraEl) {
                        otraEl.style.display = 'block';
                        otraEl.value = dictado.especialidad;
                    }
                }
            }
        }

        if (dictado.centro_medico) {
            const centroEl = document.getElementById('evt-centro');
            if (centroEl) {
                centroEl.value = dictado.centro_medico;
                if (centroEl.value !== dictado.centro_medico) {
                    centroEl.value = 'Otro';
                    const otraEl = document.getElementById('evt-centro-otra');
                    if (otraEl) {
                        otraEl.style.display = 'block';
                        otraEl.value = dictado.centro_medico;
                    }
                }
            }
        }

        if (dictado.lugar_vacuna) {
            const lugarEl = document.getElementById('vac-lugar');
            if (lugarEl) lugarEl.value = dictado.lugar_vacuna;
        }

        mostrarToast('Formulario pre-llenado. Revisa y completa lo que falta', 'exito');
    }, 400);
}

// Auto-aplicar si venimos desde voz
window.aplicarDictadoSiCorresponde = function() {
    const desdeVoz = new URLSearchParams(window.location.search).get('desde') === 'voz';
    if (!desdeVoz) return;

    const dictadoStr = sessionStorage.getItem('voz_dictado');
    if (!dictadoStr) return;

    try {
        const dictado = JSON.parse(dictadoStr);
        sessionStorage.removeItem('voz_dictado');
        // Esperamos a que estén cargados los miembros
        const intentarAplicar = () => {
            if (formState.miembros && formState.miembros.length > 0) {
                aplicarDictadoEnFormulario(dictado);
            } else {
                setTimeout(intentarAplicar, 200);
            }
        };
        setTimeout(intentarAplicar, 300);
    } catch (err) {
        console.error('Error aplicando dictado:', err);
    }
};
