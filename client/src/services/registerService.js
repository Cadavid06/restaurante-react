const register = async (email, password, role) => {
    const response = await fetch("http://localhost:3000/api/register", {
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
