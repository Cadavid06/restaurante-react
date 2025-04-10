const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api" 
const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        return data;
      }
      return false;
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }

  },
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('userId');
  }
};

export default authService;