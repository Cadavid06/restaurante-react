import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/loginService.js";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Para redirigir a otra página

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await authService.login(email, password);
    if (success) {
      navigate(success.role === "empleado" ? "/menu" : "/agg_products");
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2 text-gray-700">Correo Electrónico:</label>
          <input
            type="email"
            className="mb-4 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mb-2 text-gray-700">Contraseña:</label>
          <input
            type="password"
            className="mb-4 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
            Ingresar
          </button>
        </form>
        <a href="/register" className="block text-center mt-4 text-purple-600">
          Registrarse
        </a>
      </div>
    </div>
  );
}

export default LoginPage;
