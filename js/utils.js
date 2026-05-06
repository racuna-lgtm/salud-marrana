// =====================================================
// SALUD MARRANA - Utilidades comunes
// =====================================================

// Calcular edad desde fecha de nacimiento
// Magda (menor de 12 años) → "9 años, 4 meses"
// Resto → "47 años"
function calcularEdad(fechaNacimiento, mostrarMeses = false) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
        anios--;
        meses += 12;
    }

    if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
        if (meses < 0) meses = 11;
    }

    // Magda automáticamente tiene meses (es la menor de 12)
    const mostrarMesesAuto = mostrarMeses || anios < 12;

    if (mostrarMesesAuto && meses > 0) {
        return `${anios} años, ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    return `${anios} años`;
}

// Formatear fecha a formato chileno legible
// "2026-05-06" → "6 de mayo, 2026"
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO + 'T00:00:00');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]}, ${fecha.getFullYear()}`;
}

// Formatear fecha corta: "06/05/2026"
function formatearFechaCorta(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO + 'T00:00:00');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
}

// "Hace X días" para timestamps relativos
function tiempoRelativo(fechaISO) {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'hoy';
    if (diffDias === 1) return 'ayer';
    if (diffDias < 7) return `hace ${diffDias} días`;
    if (diffDias < 30) return `hace ${Math.floor(diffDias / 7)} ${Math.floor(diffDias / 7) === 1 ? 'semana' : 'semanas'}`;
    if (diffDias < 365) return `hace ${Math.floor(diffDias / 30)} ${Math.floor(diffDias / 30) === 1 ? 'mes' : 'meses'}`;
    return `hace ${Math.floor(diffDias / 365)} ${Math.floor(diffDias / 365) === 1 ? 'año' : 'años'}`;
}

// Días hasta una fecha futura
function diasHasta(fechaISO) {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = fecha - hoy;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Etiqueta amigable para tipos de evento
function etiquetaTipoEvento(tipo) {
    const etiquetas = {
        'sintoma': '🤒 Síntoma',
        'consulta_medica': '👩‍⚕️ Consulta médica',
        'examen': '🔬 Examen',
        'medicamento': '💊 Medicamento',
        'vacuna': '💉 Vacuna',
        'hospitalizacion': '🏥 Hospitalización',
        'control_preventivo': '✅ Control preventivo',
        'tratamiento_continuo': '🔄 Tratamiento continuo',
        'procedimiento': '🩹 Procedimiento',
        'alergia': '⚠️ Alergia',
        'medicion': '📏 Medición',
        'salud_mental': '🧠 Salud mental'
    };
    return etiquetas[tipo] || tipo;
}

// Mostrar notificación tipo toast
function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Obtener miembro por id desde la lista cargada
function obtenerMiembroPorId(miembros, id) {
    return miembros.find(m => m.id === id);
}

// Determinar color de texto que contrasta con un fondo
function colorTextoContraste(hexFondo) {
    const r = parseInt(hexFondo.slice(1, 3), 16);
    const g = parseInt(hexFondo.slice(3, 5), 16);
    const b = parseInt(hexFondo.slice(5, 7), 16);
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminancia > 0.6 ? '#1A1A2E' : '#FFFFFF';
}
