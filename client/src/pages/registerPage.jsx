import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerService from "../services/registerService";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("empleado");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await registerService.register(email, password, role);
    if (success) {
      alert("Usuario creado exitosamente");
      navigate("/");
    } else {
      alert("Error al crear el usuario");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Header */}
      <div className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Usuario</div>

      {/* Content */}
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Correo Electrónico:</label>
          <input
            type="email"
            className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mb-2 font-medium text-gray-700">Contraseña:</label>
          <input
            type="password"
            className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="mb-2 font-medium text-gray-700">Rol:</label>
          <select
            className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="empleado">Empleado</option>
            <option value="administrador">Administrador</option>
          </select>

          <button className="bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 transition duration-300">
            Crear Usuario
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-6">
        <a href="/" className="text-purple-600 hover:underline">
          Cerrar sesión
        </a>
      </div>
    </div>
  );
}

export default RegisterPage;