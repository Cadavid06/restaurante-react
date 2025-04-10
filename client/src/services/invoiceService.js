const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const invoiceService = {
  generateInvoice: async (orderId, paymentMethod) => {
    try {
      const response = await fetch(`${API_URL}/generar-factura/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago: paymentMethod }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error, idFactura: errorData.idFactura }
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de facturas:", error)
      throw error
    }
  },

  getInvoice: async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/factura/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null // No hay factura para este pedido
        }
        throw new Error("Error al obtener factura")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de facturas:", error)
      throw error
    }
  },

  downloadInvoicePDF: (invoiceId) => {
    // Abre la URL en una nueva pestaña para descargar el PDF
    window.open(`${API_URL}/generar-factura-pdf/${invoiceId}`, "_blank")
  },
}

export default invoiceService

