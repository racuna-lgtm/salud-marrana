// =====================================================
// SALUD MARRANA - Dashboard
// =====================================================

async function cargarMiembros() {
    const { data, error } = await sb
        .from('miembros')
        .select('*')
        .order('fecha_nacimiento', { ascending: true });

    if (error) {
        console.error('Error cargando miembros:', error);
        mostrarToast('Error al cargar la familia', 'error');
        return [];
    }
    return data;
}

async function cargarAlertasMiembro(miembroId) {
    const alertas = [];
    const hoy = new Date().toISOString().split('T')[0];

    // Medicamentos en curso
    const { data: meds } = await sb
        .from('medicamentos')
        .select('nombre')
        .eq('miembro_id', miembroId)
        .eq('en_curso', true);

    if (meds && meds.length > 0) {
        alertas.push({
            tipo: 'medicamento',
            texto: `💊 ${meds.length} medicamento${meds.length > 1 ? 's' : ''} en curso`,
            urgencia: 'normal'
        });
    }

    // Recordatorios próximos (siguientes 30 días)
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);
    const en30DiasStr = en30Dias.toISOString().split('T')[0];

    const { data: recs } = await sb
        .from('recordatorios')
        .select('titulo, fecha')
        .eq('miembro_id', miembroId)
        .eq('completado', false)
        .gte('fecha', hoy)
        .lte('fecha', en30DiasStr)
        .order('fecha', { ascending: true });

    if (recs && recs.length > 0) {
        const proxima = recs[0];
        const dias = diasHasta(proxima.fecha);
        let texto = '';
        if (dias === 0) texto = `📌 Hoy: ${proxima.titulo}`;
        else if (dias === 1) texto = `📌 Mañana: ${proxima.titulo}`;
        else texto = `📌 ${proxima.titulo} en ${dias} días`;
        alertas.push({
            tipo: 'recordatorio',
            texto,
            urgencia: dias <= 3 ? 'urgente' : 'proximo'
        });
    }

    // Último evento (hace cuánto fue)
    const { data: ultimo } = await sb
        .from('eventos')
        .select('fecha, tipo, titulo')
        .eq('miembro_id', miembroId)
        .order('fecha', { ascending: false })
        .limit(1);

    if (ultimo && ultimo.length > 0) {
        alertas.push({
            tipo: 'ultimo',
            texto: `📅 Último: ${tiempoRelativo(ultimo[0].fecha)}`,
            urgencia: 'normal'
        });
    }

    return alertas;
}

async function renderizarDashboard() {
    const contenedor = document.getElementById('miembros-grid');
    const loadingEl = document.getElementById('loading-miembros');

    const miembros = await cargarMiembros();

    if (miembros.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--texto-secundario);">No hay miembros cargados</p>';
        if (loadingEl) loadingEl.style.display = 'none';
        return;
    }

    // Cargar alertas en paralelo
    const alertasPorMiembro = await Promise.all(
        miembros.map(m => cargarAlertasMiembro(m.id))
    );

    let html = '';
    miembros.forEach((m, idx) => {
        const alertas = alertasPorMiembro[idx];
        const esMagda = m.apodo === 'Magda';
        const edad = calcularEdad(m.fecha_nacimiento, esMagda);

        let alertasHtml = '';
        if (alertas.length === 0) {
            alertasHtml = '<div class="sin-alertas">✨ Sin novedades</div>';
        } else {
            alertasHtml = alertas.map(a => `
                <div class="alerta-mini ${a.urgencia === 'urgente' ? 'urgente' : a.urgencia === 'proximo' ? 'proximo' : ''}">
                    ${a.texto}
                </div>
            `).join('');
        }

        html += `
            <div class="miembro-card" onclick="window.location.href='perfil.html?id=${m.id}'">
                <div class="miembro-card-color" style="background: ${m.color_hex};"></div>
                <div class="miembro-avatar" style="background: ${m.color_hex}25; color: ${m.color_hex};">
                    ${m.emoji}
                </div>
                <h3>${m.apodo}</h3>
                <div class="edad">${edad}</div>
                <div class="alertas">
                    ${alertasHtml}
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
    if (loadingEl) loadingEl.style.display = 'none';
}
