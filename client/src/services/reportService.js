const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const reportService = {
  getInvoiceReport: async (fechaInicio, fechaFin, tipo) => {
    try {
      const response = await fetch(
        `${API_URL}/consulta-facturas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tipo=${tipo}`,
      )

      if (!response.ok) {
        throw new Error("Error al consultar facturas")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de reportes:", error)
      throw error
    }
  },

  getEmployeeReport: async (fechaInicio, fechaFin) => {
    try {
      const response = await fetch(
        `${API_URL}/consul  fechaFin) => {
    try {
      const response = await fetch(
        \`${API_URL}/consulta-empleados-facturaron?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      )

      if (!response.ok) {
        throw new Error("Error al consultar empleados")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de reportes:", error)
      throw error
    }
  },

  getTopProductsReport: async (fechaInicio, fechaFin, limite) => {
    try {
      const response = await fetch(
        `${API_URL}/consulta-productos-mas-vendidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&limite=${limite}`,
      )

      if (!response.ok) {
        throw new Error("Error al consultar productos más vendidos")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de reportes:", error)
      throw error
    }
  },
}

export default reportService

