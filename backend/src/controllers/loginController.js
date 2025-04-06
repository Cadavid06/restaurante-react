import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import promisePool from "../db/db.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    const query = `
        SELECT 'administrador' as role, idAdmin as id, nombre, contraseña FROM administrador WHERE nombre = ?
        UNION ALL
        SELECT 'empleado' as role, idEmpleado as id, nombre, contraseña FROM empleado WHERE nombre = ?
    `;

    try {
        const [results] = await promisePool.query(query, [email, email]);

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.contraseña);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "tu_secreto_jwt",
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.json({ success: true, id: user.id, role: user.role });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.json({ success: true, message: "Sesión cerrada" });
};
