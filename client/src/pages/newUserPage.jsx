import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import userService from "../services/userService"
import authService from "../services/loginService"

function NewUserPage() {
  const [users, setUsers] = useState([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState({
    id: "",
    nombre: "",
    password: "",
    role: "empleado",
  })

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

      // Cargar usuarios
      loadUsers()
    }

    checkAuth()
  }, [navigate])

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      alert("Error al cargar usuarios")
    }
  }

  const handleEditUser = async (id) => {
    try {
      const userData = await userService.getUserById(id)
      setEditingUser({
        id: userData.id,
        nombre: userData.nombre,
        password: "",
        role: userData.role,
      })
      setShowEditForm(true)
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      alert("Error al cargar datos del usuario")
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      await userService.updateUser(editingUser.id, {
        nombre: editingUser.nombre,
        password: editingUser.password,
        role: editingUser.role,
      })
      alert("Usuario actualizado exitosamente")
      setShowEditForm(false)
      loadUsers()
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      alert("Error al actualizar usuario")
    }
  }

  const handleDeleteUser = async (id, role) => {
    if (window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
      try {
        await userService.deleteUser(id, role)
        alert("Usuario eliminado exitosamente")
        loadUsers()
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        alert(error.message || "Error al eliminar el usuario")
      }
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
        <div className="text-2xl font-bold">Gestión de Usuarios</div>
      </div>

      {/* Content */}
      <div className="flex flex-wrap gap-8 justify-center px-5 mb-10">
        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-blue-500 text-white p-3 text-left">ID</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Nombre</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Rol</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="border-b p-3">{user.id}</td>
                    <td className="border-b p-3">{user.nombre}</td>
                    <td className="border-b p-3">{user.role}</td>
                    <td className="border-b p-3">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.role)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario de Edición */}
        {showEditForm && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input type="hidden" value={editingUser.id} />

              <div>
                <label htmlFor="nombre" className="block mb-2 font-medium">
                  Nombre:
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 font-medium">
                  Nueva Contraseña (dejar en blanco para no cambiar):
                </label>
                <input
                  type="password"
                  id="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="role" className="block mb-2 font-medium">
                  Rol:
                </label>
                <select
                  id="role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  <option value="empleado">Empleado</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="flex justify-center gap-4">
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                  Actualizar Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center py-5 bg-gray-800 text-white">
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default NewUserPage

