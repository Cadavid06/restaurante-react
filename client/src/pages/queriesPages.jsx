"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import reportService from "../services/reportService"
import authService from "../services/loginService"

function QueriesPage() {
  // Estados para consulta de facturas
  const [fechaInicioFacturas, setFechaInicioFacturas] = useState("")
  const [fechaFinFacturas, setFechaFinFacturas] = useState("")
  const [tipoConsulta, setTipoConsulta] = useState("diaria")
  const [resultadosFacturas, setResultadosFacturas] = useState(null)

  // Estados para consulta de empleados
  const [fechaInicioEmpleados, setFechaInicioEmpleados] = useState("")
  const [fechaFinEmpleados, setFechaFinEmpleados] = useState("")
  const [resultadosEmpleados, setResultadosEmpleados] = useState(null)

  // Estados para consulta de productos
  const [fechaInicioProductos, setFechaInicioProductos] = useState("")
  const [fechaFinProductos, setFechaFinProductos] = useState("")
  const [limiteProductos, setLimiteProductos] = useState(10)
  const [resultadosProductos, setResultadosProductos] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    // Verificar autenticación y rol
    const checkAuth = async () => {
      const userRole = authService.getUserRole()
      if (!authService.isAuthenticated() || userRole !== "administrador") {
        alert("Acceso denegado")
        navigate("/")
        return
      }
    }

    checkAuth()
  }, [navigate])

  const handleConsultaFacturas = async (e) => {
    e.preventDefault()
    try {
      const data = await reportService.getInvoiceReport(fechaInicioFacturas, fechaFinFacturas, tipoConsulta)
      setResultadosFacturas(data)
    } catch (error) {
      console.error("Error al consultar facturas:", error)
      alert("Error al consultar facturas. Por favor, intente nuevamente.")
    }
  }

  const handleConsultaEmpleados = async (e) => {
    e.preventDefault()
    try {
      const data = await reportService.getEmployeeReport(fechaInicioEmpleados, fechaFinEmpleados)
      setResultadosEmpleados(data)
    } catch (error) {
      console.error("Error al consultar empleados:", error)
      alert("Error al consultar empleados. Por favor, intente nuevamente.")
    }
  }

  const handleConsultaProductos = async (e) => {
    e.preventDefault()
    try {
      const data = await reportService.getTopProductsReport(fechaInicioProductos, fechaFinProductos, limiteProductos)
      setResultadosProductos(data)
    } catch (error) {
      console.error("Error al consultar productos:", error)
      alert("Error al consultar productos más vendidos. Por favor, intente nuevamente.")
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-blue-500 text-white py-5 px-4 text-center mb-8 shadow-md">
        <h1 className="text-2xl font-bold">Consultas</h1>
      </div>

      {/* Content */}
      <div className="flex flex-wrap gap-8 justify-center px-5 mb-10">
        {/* Consulta de Facturas por Fecha */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
          <h2 className="text-xl font-bold mb-4">Consulta de Facturas por Fecha</h2>
          <form onSubmit={handleConsultaFacturas} className="space-y-4">
            <div>
              <label htmlFor="fechaInicio" className="block mb-2 font-medium">
                Fecha de inicio:
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={fechaInicioFacturas}
                onChange={(e) => setFechaInicioFacturas(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="fechaFin" className="block mb-2 font-medium">
                Fecha de fin:
              </label>
              <input
                type="date"
                id="fechaFin"
                value={fechaFinFacturas}
                onChange={(e) => setFechaFinFacturas(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="tipoConsulta" className="block mb-2 font-medium">
                Tipo de consulta:
              </label>
              <select
                id="tipoConsulta"
                value={tipoConsulta}
                onChange={(e) => setTipoConsulta(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>

            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full">
              Consultar
            </button>
          </form>

          {resultadosFacturas && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-bold mb-2">Resultados:</h3>
              <p>Total de facturas: {resultadosFacturas.totalFacturas}</p>
              <p>Monto total: ${resultadosFacturas.montoTotal.toFixed(2)}</p>

              {resultadosFacturas.detalles && resultadosFacturas.detalles.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Detalles:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {resultadosFacturas.detalles.map((detalle, index) => (
                      <li key={index}>
                        {detalle.fecha}: {detalle.cantidad} facturas, ${detalle.monto.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4">No se encontraron resultados para el período seleccionado.</p>
              )}
            </div>
          )}
        </div>

        {/* Consulta de Empleados que Facturaron */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
          <h2 className="text-xl font-bold mb-4">Consulta de Empleados que Facturaron</h2>
          <form onSubmit={handleConsultaEmpleados} className="space-y-4">
            <div>
              <label htmlFor="fechaInicioEmpleados" className="block mb-2 font-medium">
                Fecha de inicio:
              </label>
              <input
                type="date"
                id="fechaInicioEmpleados"
                value={fechaInicioEmpleados}
                onChange={(e) => setFechaInicioEmpleados(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="fechaFinEmpleados" className="block mb-2 font-medium">
                Fecha de fin:
              </label>
              <input
                type="date"
                id="fechaFinEmpleados"
                value={fechaFinEmpleados}
                onChange={(e) => setFechaFinEmpleados(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full">
              Consultar
            </button>
          </form>

          {resultadosEmpleados && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-bold mb-2">Empleados que facturaron:</h3>

              {resultadosEmpleados.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {resultadosEmpleados.map((empleado, index) => (
                    <li key={index}>
                      ID: {empleado.idEmpleado}, Nombre: {empleado.nombre}, Facturas: {empleado.totalFacturas}, Monto
                      total: ${empleado.montoTotal.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se encontraron resultados para el período seleccionado.</p>
              )}
            </div>
          )}
        </div>

        {/* Consulta de Productos Más Vendidos */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
          <h2 className="text-xl font-bold mb-4">Consulta de Productos Más Vendidos</h2>
          <form onSubmit={handleConsultaProductos} className="space-y-4">
            <div>
              <label htmlFor="fechaInicioProductos" className="block mb-2 font-medium">
                Fecha de inicio:
              </label>
              <input
                type="date"
                id="fechaInicioProductos"
                value={fechaInicioProductos}
                onChange={(e) => setFechaInicioProductos(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="fechaFinProductos" className="block mb-2 font-medium">
                Fecha de fin:
              </label>
              <input
                type="date"
                id="fechaFinProductos"
                value={fechaFinProductos}
                onChange={(e) => setFechaFinProductos(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="limiteProductos" className="block mb-2 font-medium">
                Número de productos:
              </label>
              <input
                type="number"
                id="limiteProductos"
                min="1"
                max="50"
                value={limiteProductos}
                onChange={(e) => setLimiteProductos(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full">
              Consultar
            </button>
          </form>

          {resultadosProductos && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-bold mb-2">Productos más vendidos:</h3>

              {resultadosProductos.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-2">
                  {resultadosProductos.map((producto, index) => (
                    <li key={index}>
                      {producto.descripcion} - Cantidad vendida: {producto.cantidadVendida}, Monto total: $
                      {producto.montoTotal.toFixed(2)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No se encontraron resultados para el período seleccionado.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center py-5 bg-gray-800 text-white">
        <div className="mb-4">
          <a href="/agg_products" className="text-blue-400 hover:text-blue-300">
            Regresar
          </a>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default QueriesPage

