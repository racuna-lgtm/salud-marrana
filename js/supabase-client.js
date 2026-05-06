// =====================================================
// SALUD MARRANA - Cliente Supabase
// =====================================================

// Inicializar cliente de Supabase
const { createClient } = supabase;

const sb = createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Helper: verificar si hay sesión activa
async function verificarSesion() {
    const { data: { session }, error } = await sb.auth.getSession();
    if (error) {
        console.error('Error verificando sesión:', error);
        return null;
    }
    return session;
}

// Helper: obtener usuario actual
async function obtenerUsuario() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
}
