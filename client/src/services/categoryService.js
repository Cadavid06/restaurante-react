const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`)
      if (!response.ok) {
        throw new Error("Error al obtener categorías")
      }
      const data = await response.json()
      console.log("Datos de categorías recibidos:", data)
      return data
    } catch (error) {
      console.error("Error en el servicio de categorías:", error)
      throw error
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/categoria/${id}`)
      if (!response.ok) {
        throw new Error("Error al obtener categoría")
      }
      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de categorías:", error)
      throw error
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categoria/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar categoría")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de categorías:", error)
      throw error
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await fetch(`${API_URL}/categoria/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar categoría")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de categorías:", error)
      throw error
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categoria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error("Error al crear categoría")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de categorías:", error)
      throw error
    }
  },
}

export default categoryService

