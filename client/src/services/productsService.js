const API_URL = "http://localhost:3000/api"

const productService = {
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/productos`)
      if (!response.ok) {
        throw new Error("Error al obtener productos")
      }
      const data = await response.json()
      console.log("Datos de productos recibidos:", data)
      return data
    } catch (error) {
      console.error("Error en el servicio de productos:", error)
      throw error
    }
  },

  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/producto/${id}`)
      if (!response.ok) {
        throw new Error("Error al obtener producto")
      }
      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de productos:", error)
      throw error
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Error al crear producto")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de productos:", error)
      throw error
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await fetch(`${API_URL}/producto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar producto")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de productos:", error)
      throw error
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_URL}/producto/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar producto")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de productos:", error)
      throw error
    }
  },
}

export default productService

