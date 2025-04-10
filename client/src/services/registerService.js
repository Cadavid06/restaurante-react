const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const register = async (email, password, role) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
        throw new Error("Error en el registro");
    }

    return await response.json();
};

export default { register };