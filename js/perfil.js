// =====================================================
// SALUD MARRANA - Perfil individual
// =====================================================

async function cargarPerfilCompleto(miembroId) {
    // Datos básicos del miembro
    const { data: miembro, error: errMiembro } = await sb
        .from('miembros')
        .select('*')
        .eq('id', miembroId)
        .single();

    if (errMiembro) throw errMiembro;

    // Condiciones crónicas
    const { data: condiciones } = await sb
        .from('condiciones_cronicas')
        .select('*')
        .eq('miembro_id', miembroId)
        .eq('activa', true);

    // Medicamentos en curso
    const { data: medicamentos } = await sb
        .from('medicamentos')
        .select('*')
        .eq('miembro_id', miembroId)
        .eq('en_curso', true);

    // Últimos 5 eventos
    const { data: eventos } = await sb
        .from('eventos')
        .select('*')
        .eq('miembro_id', miembroId)
        .order('fecha', { ascending: false })
        .limit(5);

    // Próximos recordatorios
    const hoy = new Date().toISOString().split('T')[0];
    const { data: recordatorios } = await sb
        .from('recordatorios')
        .select('*')
        .eq('miembro_id', miembroId)
        .eq('completado', false)
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .limit(3);

    return {
        miembro,
        condiciones: condiciones || [],
        medicamentos: medicamentos || [],
        eventos: eventos || [],
        recordatorios: recordatorios || []
    };
}

function renderizarPerfil(datos) {
    const { miembro, condiciones, medicamentos, eventos, recordatorios } = datos;
    const esMagda = miembro.apodo === 'Magda';
    const edad = calcularEdad(miembro.fecha_nacimiento, esMagda);

    // Hero
    const heroEl = document.getElementById('perfil-hero');
    heroEl.style.background = `linear-gradient(135deg, ${miembro.color_hex} 0%, ${miembro.color_hex}DD 100%)`;
    heroEl.innerHTML = `
        <div class="perfil-hero-emoji">${miembro.emoji}</div>
        <h2>${miembro.apodo}</h2>
        <div class="nombre-completo">${miembro.nombre}</div>
        <div class="edad-grande">${edad}</div>
    `;

    // Datos básicos
    const datosBasicos = document.getElementById('datos-basicos');
    datosBasicos.innerHTML = `
        <h4>Datos básicos</h4>
        <div class="info-row">
            <span class="etiqueta">Fecha de nacimiento</span>
            <span class="valor">${formatearFechaCorta(miembro.fecha_nacimiento)}</span>
        </div>
        <div class="info-row">
            <span class="etiqueta">Previsión</span>
            <span class="valor">${miembro.prevision || 'Sin registrar'}</span>
        </div>
        <div class="info-row">
            <span class="etiqueta">Grupo sanguíneo</span>
            <span class="valor">${miembro.grupo_sanguineo || 'Sin registrar'}</span>
        </div>
    `;

    // Condiciones crónicas
    const condicionesEl = document.getElementById('condiciones');
    if (condiciones.length > 0) {
        condicionesEl.innerHTML = `
            <h4>Condiciones crónicas</h4>
            <div>
                ${condiciones.map(c => `<span class="condicion-tag">⚠️ ${c.nombre}</span>`).join('')}
            </div>
        `;
        condicionesEl.style.display = 'block';
    } else {
        condicionesEl.style.display = 'none';
    }

    // Medicamentos en curso
    const medsEl = document.getElementById('medicamentos-curso');
    if (medicamentos.length > 0) {
        let medsHtml = '<h4>💊 Medicamentos en curso</h4>';
        medicamentos.forEach(m => {
            medsHtml += `
                <div class="medicamento-curso-row">
                    <div class="medicamento-curso-info">
                        <div class="nombre">${m.nombre}</div>
                        <div class="detalle">${m.dosis || ''} ${m.frecuencia ? '· ' + m.frecuencia : ''}${m.motivo ? ' · ' + m.motivo : ''}</div>
                    </div>
                    <button class="btn-finalizar-mini" onclick="finalizarMedicamento('${m.id}', '${miembro.id}')">✓ Finalizar</button>
                </div>
            `;
        });
        medsEl.innerHTML = medsHtml;
        medsEl.style.display = 'block';
    } else {
        medsEl.style.display = 'none';
    }

    // Próximos recordatorios
    const recsEl = document.getElementById('recordatorios');
    if (recordatorios.length > 0) {
        recsEl.innerHTML = `
            <h4>⏰ Próximos pendientes</h4>
            ${recordatorios.map(r => {
                const dias = diasHasta(r.fecha);
                let cuando = '';
                if (dias === 0) cuando = 'Hoy';
                else if (dias === 1) cuando = 'Mañana';
                else cuando = `En ${dias} días`;
                return `
                    <div class="info-row">
                        <span class="etiqueta">${r.titulo}</span>
                        <span class="valor">${cuando}</span>
                    </div>
                `;
            }).join('')}
        `;
        recsEl.style.display = 'block';
    } else {
        recsEl.style.display = 'none';
    }

    // Historial de eventos
    const eventosEl = document.getElementById('eventos-recientes');
    if (eventos.length > 0) {
        eventosEl.innerHTML = `
            <h4>Últimos eventos</h4>
            ${eventos.map(e => `
                <div class="info-row evento-clickeable" onclick="window.location.href='evento.html?id=${e.id}'">
                    <span class="etiqueta">${etiquetaTipoEvento(e.tipo)}<br><small style="font-size: 11px; color: var(--texto-secundario);">${e.titulo}</small></span>
                    <span class="valor">${formatearFechaCorta(e.fecha)} ›</span>
                </div>
            `).join('')}
        `;
    } else {
        eventosEl.innerHTML = `
            <h4>Últimos eventos</h4>
            <div class="estado-vacio">
                <span class="emoji">📭</span>
                <p>Sin eventos registrados todavía</p>
            </div>
        `;
    }

    // Mostrar contenido y ocultar loading
    document.getElementById('loading-perfil').style.display = 'none';
    document.getElementById('perfil-contenido').style.display = 'block';
}
