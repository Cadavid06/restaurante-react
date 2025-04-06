const API_URL = "http://localhost:3000/api"

const userService = {
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`)
      if (!response.ok) {
        throw new Error("Error al obtener usuarios")
      }
      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de usuarios:", error)
      throw error
    }
  },

  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/usuario/${id}`)
      if (!response.ok) {
        throw new Error("Error al obtener usuario")
      }
      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de usuarios:", error)
      throw error
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_URL}/usuario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar usuario")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de usuarios:", error)
      throw error
    }
  },

  deleteUser: async (id, role) => {
    try {
      const response = await fetch(`${API_URL}/usuario/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en el servicio de usuarios:", error)
      throw error
    }
  },
}

export default userService

