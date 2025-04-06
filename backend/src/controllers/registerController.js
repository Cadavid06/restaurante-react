import bcrypt from "bcrypt";
import promisePool from "../db/db.js";

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let insertQuery;
        if (role === "administrador") {
            insertQuery = "INSERT INTO administrador (nombre, contraseña) VALUES (?, ?)";
        } else if (role === "empleado") {
            insertQuery = "INSERT INTO empleado (nombre, contraseña) VALUES (?, ?)";
        } else {
            return res.status(400).json({ success: false, message: "Rol inválido" });
        }

        await promisePool.query(insertQuery, [email, hashedPassword]);

        res.status(201).json({ success: true, message: "Usuario registrado exitosamente" });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
};
