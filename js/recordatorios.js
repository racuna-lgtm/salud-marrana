// =====================================================
// SALUD MARRANA - Recordatorios futuros
// =====================================================

const TIPOS_RECORDATORIO = {
    control: { emoji: '📅', label: 'Cita médica / control' },
    examen: { emoji: '🔬', label: 'Examen pendiente' },
    medicamento: { emoji: '💊', label: 'Retirar medicamento' },
    vacuna: { emoji: '💉', label: 'Vacuna por poner' },
    otro: { emoji: '📌', label: 'Otro' }
};

// Cargar todos los recordatorios pendientes
async function cargarRecordatorios(filtroMiembro = null) {
    let query = sb
        .from('recordatorios')
        .select('*, miembros(apodo, color_hex, emoji)')
        .eq('completado', false)
        .order('fecha', { ascending: true });

    if (filtroMiembro) {
        query = query.eq('miembro_id', filtroMiembro);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error cargando recordatorios:', error);
        return [];
    }
    return data || [];
}

// Cargar miembros para selector
async function cargarMiembrosSimple() {
    const { data } = await sb
        .from('miembros')
        .select('id, apodo, color_hex, emoji')
        .order('fecha_nacimiento', { ascending: true });
    return data || [];
}

// Determinar urgencia de un recordatorio
function urgenciaRecordatorio(fechaISO) {
    const dias = diasHasta(fechaISO);
    if (dias < 0) return { nivel: 'vencido', emoji: '⚠️', texto: 'Vencido', color: 'var(--color-error)' };
    if (dias === 0) return { nivel: 'hoy', emoji: '🔴', texto: 'Hoy', color: 'var(--color-error)' };
    if (dias === 1) return { nivel: 'maniana', emoji: '🟠', texto: 'Mañana', color: 'var(--color-alerta)' };
    if (dias <= 3) return { nivel: 'pronto', emoji: '🟡', texto: `En ${dias} días`, color: 'var(--color-alerta)' };
    if (dias <= 7) return { nivel: 'esta_semana', emoji: '🟢', texto: `En ${dias} días`, color: 'var(--color-exito)' };
    if (dias <= 30) return { nivel: 'este_mes', emoji: '🟢', texto: `En ${dias} días`, color: 'var(--texto-secundario)' };
    return { nivel: 'lejano', emoji: '📅', texto: `En ${dias} días`, color: 'var(--texto-secundario)' };
}

// Renderizar lista de recordatorios
function renderizarRecordatorios(recordatorios) {
    const cont = document.getElementById('recordatorios-lista');

    if (recordatorios.length === 0) {
        cont.innerHTML = `
            <div class="estado-vacio">
                <span class="emoji">✨</span>
                <p>No hay recordatorios pendientes</p>
                <p style="font-size: 12px; margin-top: 8px;">Toca el botón de abajo para agregar uno</p>
            </div>
        `;
        return;
    }

    let html = '';
    recordatorios.forEach(r => {
        const urgencia = urgenciaRecordatorio(r.fecha);
        const tipo = TIPOS_RECORDATORIO[r.tipo] || TIPOS_RECORDATORIO.otro;
        const m = r.miembros;

        html += `
            <div class="recordatorio-card urgencia-${urgencia.nivel}">
                <div class="recordatorio-color" style="background: ${m.color_hex};"></div>
                <div class="recordatorio-content">
                    <div class="recordatorio-header">
                        <span class="recordatorio-tipo">${tipo.emoji} ${tipo.label}</span>
                        <span class="recordatorio-urgencia" style="color: ${urgencia.color};">
                            ${urgencia.emoji} ${urgencia.texto}
                        </span>
                    </div>
                    <h4 class="recordatorio-titulo">${r.titulo}</h4>
                    <div class="recordatorio-meta">
                        <span>${m.emoji} ${m.apodo}</span>
                        <span>📅 ${formatearFechaCorta(r.fecha)}</span>
                    </div>
                    ${r.descripcion ? `<div class="recordatorio-descripcion">${r.descripcion}</div>` : ''}
                </div>
                <div class="recordatorio-acciones">
                    <button class="btn-recordatorio-completar" onclick="completarRecordatorio('${r.id}')" title="Marcar como completado">✓</button>
                    <button class="btn-recordatorio-eliminar" onclick="eliminarRecordatorio('${r.id}')" title="Eliminar">✕</button>
                </div>
            </div>
        `;
    });

    cont.innerHTML = html;
}

// Mostrar formulario de nuevo recordatorio
window.abrirFormRecordatorio = function() {
    const modal = document.createElement('div');
    modal.className = 'voz-modal visible';
    modal.id = 'modal-recordatorio';
    modal.innerHTML = `
        <div class="voz-modal-content" style="max-width: 480px;">
            <div class="voz-modal-header">
                <h3>📌 Nuevo recordatorio</h3>
                <button class="voz-cerrar" onclick="cerrarFormRecordatorio()">✕</button>
            </div>
            <div class="voz-modal-body">
                <div class="form-group">
                    <label>Para quién *</label>
                    <div id="rec-miembros-selector" class="miembros-selector"></div>
                </div>
                <div class="form-group">
                    <label for="rec-tipo">Tipo *</label>
                    <select id="rec-tipo" class="form-input">
                        ${Object.entries(TIPOS_RECORDATORIO).map(([k, v]) => `
                            <option value="${k}">${v.emoji} ${v.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="rec-titulo">Título *</label>
                    <input type="text" id="rec-titulo" class="form-input" placeholder="Ej: Control con Dr. Pérez" required>
                </div>
                <div class="form-group">
                    <label for="rec-fecha">Fecha *</label>
                    <input type="date" id="rec-fecha" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="rec-descripcion">Notas (opcional)</label>
                    <textarea id="rec-descripcion" class="form-input form-textarea" rows="2" placeholder="Detalles adicionales"></textarea>
                </div>
            </div>
            <div class="voz-modal-footer">
                <button class="btn-primary" onclick="guardarRecordatorio()">Guardar recordatorio</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Cargar selector de miembros
    cargarMiembrosSimple().then(miembros => {
        const selectorEl = document.getElementById('rec-miembros-selector');
        let html = '';
        miembros.forEach(m => {
            html += `
                <div class="miembro-chip" data-id="${m.id}" onclick="seleccionarMiembroRec('${m.id}')" style="--color-miembro: ${m.color_hex};">
                    <span class="miembro-chip-emoji">${m.emoji}</span>
                    <span class="miembro-chip-nombre">${m.apodo}</span>
                </div>
            `;
        });
        selectorEl.innerHTML = html;
    });
};

window.seleccionarMiembroRec = function(id) {
    document.querySelectorAll('#rec-miembros-selector .miembro-chip').forEach(c => c.classList.remove('seleccionado'));
    document.querySelector(`#rec-miembros-selector .miembro-chip[data-id="${id}"]`).classList.add('seleccionado');
    window._recMiembroId = id;
};

window.cerrarFormRecordatorio = function() {
    const modal = document.getElementById('modal-recordatorio');
    if (modal) modal.remove();
    window._recMiembroId = null;
};

window.guardarRecordatorio = async function() {
    const miembroId = window._recMiembroId;
    const tipo = document.getElementById('rec-tipo').value;
    const titulo = document.getElementById('rec-titulo').value.trim();
    const fecha = document.getElementById('rec-fecha').value;
    const descripcion = document.getElementById('rec-descripcion').value.trim() || null;

    if (!miembroId) return mostrarToast('Falta elegir el miembro', 'error');
    if (!titulo) return mostrarToast('Falta el título', 'error');
    if (!fecha) return mostrarToast('Falta la fecha', 'error');

    try {
        const { error } = await sb.from('recordatorios').insert({
            miembro_id: miembroId,
            tipo,
            titulo,
            fecha,
            descripcion,
            completado: false
        });
        if (error) throw error;

        mostrarToast('Recordatorio creado ✅', 'exito');
        cerrarFormRecordatorio();

        // Recargar lista si estamos en la pantalla de recordatorios
        if (typeof refrescarRecordatorios === 'function') {
            refrescarRecordatorios();
        }
    } catch (err) {
        console.error(err);
        mostrarToast('Error al guardar: ' + err.message, 'error');
    }
};

// Completar un recordatorio (preguntar si convertir en evento)
window.completarRecordatorio = async function(recordatorioId) {
    // Cargar el recordatorio
    const { data: rec, error } = await sb
        .from('recordatorios')
        .select('*, miembros(apodo)')
        .eq('id', recordatorioId)
        .single();

    if (error) {
        mostrarToast('Error cargando recordatorio', 'error');
        return;
    }

    // Modal de confirmación
    const modal = document.createElement('div');
    modal.className = 'voz-modal visible';
    modal.id = 'modal-completar';
    modal.innerHTML = `
        <div class="voz-modal-content" style="max-width: 420px;">
            <div class="voz-modal-header">
                <h3>✓ Completar recordatorio</h3>
                <button class="voz-cerrar" onclick="cerrarModalCompletar()">✕</button>
            </div>
            <div class="voz-modal-body">
                <p style="margin-bottom: 8px;"><b>${rec.titulo}</b></p>
                <p style="color: var(--texto-secundario); font-size: 13px; margin-bottom: 20px;">
                    ${rec.miembros.apodo} · ${formatearFechaCorta(rec.fecha)}
                </p>
                <p style="margin-bottom: 16px;">¿Quieres registrar el evento que ocurrió?</p>
                <p style="font-size: 13px; color: var(--texto-secundario);">
                    Por ejemplo, si fuiste al control, registramos la consulta médica con todos sus detalles.
                </p>
            </div>
            <div class="voz-modal-footer" style="display: flex; gap: 10px;">
                <button class="btn-secundario" onclick="completarSinEvento('${recordatorioId}')" style="flex: 1; color: var(--texto-secundario); border-color: var(--borde);">
                    Solo completar
                </button>
                <button class="btn-primary" onclick="completarYRegistrar('${recordatorioId}')" style="flex: 1;">
                    Registrar evento
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.cerrarModalCompletar = function() {
    const modal = document.getElementById('modal-completar');
    if (modal) modal.remove();
};

// Solo completar (sin convertir en evento)
window.completarSinEvento = async function(recordatorioId) {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const { error } = await sb
            .from('recordatorios')
            .update({ completado: true, fecha_completado: hoy })
            .eq('id', recordatorioId);
        if (error) throw error;

        mostrarToast('Recordatorio completado ✅', 'exito');
        cerrarModalCompletar();
        if (typeof refrescarRecordatorios === 'function') refrescarRecordatorios();
    } catch (err) {
        mostrarToast('Error: ' + err.message, 'error');
    }
};

// Completar y llevar al formulario de nuevo evento con datos pre-llenados
window.completarYRegistrar = async function(recordatorioId) {
    try {
        // Obtener datos del recordatorio
        const { data: rec } = await sb
            .from('recordatorios')
            .select('*')
            .eq('id', recordatorioId)
            .single();

        // Mapear tipo de recordatorio a tipo de evento
        const mapeo = {
            'control': 'control_preventivo',
            'examen': 'examen',
            'medicamento': 'medicamento',
            'vacuna': 'vacuna',
            'otro': 'consulta_medica'
        };
        const tipoEvento = mapeo[rec.tipo] || 'consulta_medica';

        // Marcar como completado
        const hoy = new Date().toISOString().split('T')[0];
        await sb
            .from('recordatorios')
            .update({ completado: true, fecha_completado: hoy })
            .eq('id', recordatorioId);

        // Guardar en sessionStorage los datos pre-llenados (estilo voz)
        const dictado = {
            miembro: null, // Se busca por ID después
            miembroId: rec.miembro_id,
            tipo: tipoEvento,
            titulo: rec.titulo,
            descripcion: rec.descripcion || null,
            fecha: hoy
        };
        sessionStorage.setItem('voz_dictado', JSON.stringify(dictado));

        cerrarModalCompletar();
        mostrarToast('Recordatorio completado, ahora registra el evento', 'exito');

        setTimeout(() => {
            window.location.href = `nuevo-evento.html?desde=voz&miembro=${rec.miembro_id}`;
        }, 600);
    } catch (err) {
        console.error(err);
        mostrarToast('Error: ' + err.message, 'error');
    }
};

window.eliminarRecordatorio = async function(recordatorioId) {
    if (!confirm('¿Eliminar este recordatorio?')) return;
    try {
        const { error } = await sb.from('recordatorios').delete().eq('id', recordatorioId);
        if (error) throw error;
        mostrarToast('Recordatorio eliminado', 'exito');
        if (typeof refrescarRecordatorios === 'function') refrescarRecordatorios();
    } catch (err) {
        mostrarToast('Error: ' + err.message, 'error');
    }
};

// Filtros
let filtroMiembroActual = null;

async function refrescarRecordatorios() {
    const recs = await cargarRecordatorios(filtroMiembroActual);
    renderizarRecordatorios(recs);
}

window.filtrarPorMiembro = function(miembroId) {
    filtroMiembroActual = miembroId === 'todos' ? null : miembroId;
    document.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('activo'));
    document.querySelector(`.filtro-chip[data-id="${miembroId || 'todos'}"]`).classList.add('activo');
    refrescarRecordatorios();
};

async function inicializarRecordatorios() {
    // Cargar filtros de miembros
    const miembros = await cargarMiembrosSimple();
    const filtrosEl = document.getElementById('filtros-miembros');
    let html = `
        <div class="filtro-chip activo" data-id="todos" onclick="filtrarPorMiembro('todos')">
            👨‍👩‍👧‍👦 Todos
        </div>
    `;
    miembros.forEach(m => {
        html += `
            <div class="filtro-chip" data-id="${m.id}" onclick="filtrarPorMiembro('${m.id}')" style="--color-miembro: ${m.color_hex};">
                ${m.emoji} ${m.apodo}
            </div>
        `;
    });
    filtrosEl.innerHTML = html;

    // Cargar lista
    await refrescarRecordatorios();
}
