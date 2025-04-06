import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import categoryService from "../services/categoryService"
import productService from "../services/productsService"
import authService from "../services/loginService"

function AdminPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false)
  const [showEditProductForm, setShowEditProductForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState({ id: "", nombre: "" })
  const [editingProduct, setEditingProduct] = useState({
    id: "",
    descripcion: "",
    precio: "",
    idCategoria: "",
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

      // Cargar datos
      loadCategories()
      loadProducts()
    }

    checkAuth()
  }, [navigate])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error al cargar productos:", error)
    }
  }

  const handleEditCategory = (id, nombre) => {
    setEditingCategory({ id, nombre })
    setShowEditCategoryForm(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    try {
      await categoryService.updateCategory(editingCategory.id, { nombre_categoria: editingCategory.nombre })
      alert("Categoría actualizada exitosamente")
      setShowEditCategoryForm(false)
      loadCategories()
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      alert("Error al actualizar categoría")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta categoría?")) {
      try {
        await categoryService.deleteCategory(id)
        alert("Categoría eliminada exitosamente")
        loadCategories()
      } catch (error) {
        console.error("Error al eliminar categoría:", error)
        alert("Error al eliminar categoría")
      }
    }
  }

  const handleEditProduct = (id, descripcion, precio, idCategoria) => {
    setEditingProduct({ id, descripcion, precio, idCategoria })
    setShowEditProductForm(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      await productService.updateProduct(editingProduct.id, {
        descripcion: editingProduct.descripcion,
        precio: Number.parseFloat(editingProduct.precio),
        idCategoria: editingProduct.idCategoria,
      })
      alert("Producto actualizado exitosamente")
      setShowEditProductForm(false)
      loadProducts()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      alert("Error al actualizar producto")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este producto?")) {
      try {
        await productService.deleteProduct(id)
        alert("Producto eliminado exitosamente")
        loadProducts()
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        alert("Error al eliminar producto")
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
        <h1 className="text-2xl font-bold">Gestión de Categorías y Productos</h1>
      </div>

      {/* Content */}
      <div className="flex flex-wrap gap-8 justify-center px-5 mb-10">
        {/* Categorías */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Categorías</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-blue-500 text-white p-3 text-left">ID</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Nombre</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-100">
                    <td className="border-b p-3">{category.id}</td>
                    <td className="border-b p-3">{category.nombre}</td>
                    <td className="border-b p-3">
                      <button
                        onClick={() => handleEditCategory(category.id, category.nombre)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Productos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-blue-500 text-white p-3 text-left">ID</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Descripción</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Precio</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Categoría</th>
                  <th className="bg-blue-500 text-white p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-100">
                    <td className="border-b p-3">{product.id}</td>
                    <td className="border-b p-3">{product.descripcion}</td>
                    <td className="border-b p-3">${product.precio}</td>
                    <td className="border-b p-3">
                      {categories.find((c) => c.id === product.idCategoria)?.nombre || "N/A"}
                    </td>
                    <td className="border-b p-3">
                      <button
                        onClick={() =>
                          handleEditProduct(product.id, product.descripcion, product.precio, product.idCategoria)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

        {/* Formulario de edición de categoría */}
        {showEditCategoryForm && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Categoría</h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <input type="hidden" value={editingCategory.id} />
              <div>
                <label htmlFor="categoriaNombre" className="block mb-2 font-medium">
                  Nombre de la categoría:
                </label>
                <input
                  type="text"
                  id="categoriaNombre"
                  value={editingCategory.nombre}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-center gap-4">
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCategoryForm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario de edición de producto */}
        {showEditProductForm && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Producto</h3>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <input type="hidden" value={editingProduct.id} />
              <div>
                <label htmlFor="productoDescripcion" className="block mb-2 font-medium">
                  Descripción:
                </label>
                <input
                  type="text"
                  id="productoDescripcion"
                  value={editingProduct.descripcion}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="productoPrecio" className="block mb-2 font-medium">
                  Precio:
                </label>
                <input
                  type="number"
                  id="productoPrecio"
                  step="0.01"
                  value={editingProduct.precio}
                  onChange={(e) => setEditingProduct({ ...editingProduct, precio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="productoCategoriaId" className="block mb-2 font-medium">
                  Categoría:
                </label>
                <select
                  id="productoCategoriaId"
                  value={editingProduct.idCategoria}
                  onChange={(e) => setEditingProduct({ ...editingProduct, idCategoria: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center gap-4">
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProductForm(false)}
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
        <div className="mb-4">
          <a href="/agg_products" className="text-blue-400 hover:text-blue-300 mr-4">
            Volver
          </a>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default AdminPage

