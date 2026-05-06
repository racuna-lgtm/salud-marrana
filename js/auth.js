// =====================================================
// SALUD MARRANA - Autenticación
// =====================================================

async function iniciarSesion(email, password) {
    try {
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // Traducimos errores comunes al chileno
            let mensaje = 'No pudimos iniciar sesión';
            if (error.message.includes('Invalid login credentials')) {
                mensaje = 'Correo o contraseña incorrectos';
            } else if (error.message.includes('Email not confirmed')) {
                mensaje = 'Email no confirmado. Revisa tu bandeja de entrada';
            } else if (error.message.includes('network')) {
                mensaje = 'Sin conexión a internet';
            }
            return { error: mensaje };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error en login:', err);
        return { error: 'Error inesperado, intenta de nuevo' };
    }
}

async function cerrarSesion() {
    const { error } = await sb.auth.signOut();
    if (error) {
        console.error('Error cerrando sesión:', error);
        alert('No pudimos cerrar sesión, intenta de nuevo');
        return;
    }
    window.location.href = 'login.html';
}

// Proteger páginas: si no hay sesión, redirigir a login
async function protegerPagina() {
    const session = await verificarSesion();
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
