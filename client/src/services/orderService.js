const API_URL = 'http://localhost:3000/api'; 
// Eliminar los métodos relacionados con facturas si existen en orderService.js
// y dejar solo los métodos relacionados con pedidos

const orderService = {
    getOrders: async () => {
      try {
        const response = await fetch(`${API_URL}/pedidos`)
        if (!response.ok) {
          throw new Error("Error al obtener pedidos")
        }
        return await response.json()
      } catch (error) {
        console.error("Error en el servicio de pedidos:", error)
        throw error
      }
    },
  
    getOrderById: async (id) => {
      try {
        const response = await fetch(`${API_URL}/pedido/${id}`)
        if (!response.ok) {
          throw new Error("Error al obtener pedido")
        }
        return await response.json()
      } catch (error) {
        console.error("Error en el servicio de pedidos:", error)
        throw error
      }
    },
  
    updateOrder: async (id, orderData) => {
      try {
        const response = await fetch(`${API_URL}/pedido/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })
  
        if (!response.ok) {
          throw new Error("Error al actualizar pedido")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error en el servicio de pedidos:", error)
        throw error
      }
    },
  
    deleteOrder: async (id) => {
      try {
        const response = await fetch(`${API_URL}/pedido/${id}`, {
          method: "DELETE",
        })
  
        if (!response.ok) {
          throw new Error("Error al eliminar pedido")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error en el servicio de pedidos:", error)
        throw error
      }
    },
  
    createOrder: async (orderData) => {
      try {
        const response = await fetch(`${API_URL}/pedido`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })
  
        if (!response.ok) {
          throw new Error("Error al crear pedido")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error en el servicio de pedidos:", error)
        throw error
      }
    },
  }
  
  export default orderService
  
  