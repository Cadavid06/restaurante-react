"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import productService from "../services/productsService"
import categoryService from "../services/categoryService"
import authService from "../services/loginService"

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    descripcion: "",
    precio: "",
    idCategoria: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      await loadData()
    }

    checkAuth()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadCategories(), loadProducts()])
    } catch (err) {
      setError("Error al cargar datos. Por favor, intente nuevamente.")
      console.error("Error al cargar datos:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      console.log("Categorías cargadas en ProductsPage:", data)
      setCategories(data || [])
      // Si hay categorías y no hay una categoría seleccionada, seleccionar la primera
      if (data && data.length > 0 && !newProduct.idCategoria) {
        setNewProduct((prev) => ({ ...prev, idCategoria: data[0].id }))
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      throw error
    }
  }

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts()
      console.log("Productos cargados:", data)
      setProducts(data || [])
    } catch (error) {
      console.error("Error al cargar productos:", error)
      throw error
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      await productService.createProduct({
        descripcion: newProduct.descripcion,
        precio: Number.parseFloat(newProduct.precio),
        idCategoria: newProduct.idCategoria,
      })

      alert("Producto agregado exitosamente")
      setNewProduct({
        descripcion: "",
        precio: "",
        idCategoria: categories.length > 0 ? categories[0].id : "",
      })
      setShowAddForm(false)
      loadProducts()
    } catch (error) {
      console.error("Error al agregar producto:", error)
      alert("Error al agregar producto")
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.idCategoria === selectedCategory
    const matchesSearch = product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.nombre : "Sin categoría"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadData} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-blue-500 text-white py-5 px-4 text-center mb-8 shadow-md">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
      </div>

      {/* Filters and Add Button */}
      <div className="px-4 mb-6 max-w-6xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="categoryFilter" className="block mb-1 text-sm font-medium">
              Filtrar por categoría:
            </label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="searchInput" className="block mb-1 text-sm font-medium">
              Buscar:
            </label>
            <input
              type="text"
              id="searchInput"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Agregar Producto
        </button>
      </div>

      {/* Products Table */}
      <div className="px-4 mb-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-100">
                    <td className="border-b p-3">{product.id}</td>
                    <td className="border-b p-3">{product.descripcion}</td>
                    <td className="border-b p-3">${product.precio}</td>
                    <td className="border-b p-3">{getCategoryName(product.idCategoria)}</td>
                    <td className="border-b p-3">
                      <button
                        onClick={() => navigate(`/edit-product/${product.id}`)}
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    {searchTerm || selectedCategory !== "all"
                      ? "No se encontraron productos con los filtros aplicados"
                      : "No hay productos disponibles"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agregar Nuevo Producto</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label htmlFor="descripcion" className="block mb-2 font-medium">
                  Descripción:
                </label>
                <input
                  type="text"
                  id="descripcion"
                  value={newProduct.descripcion}
                  onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="precio" className="block mb-2 font-medium">
                  Precio:
                </label>
                <input
                  type="number"
                  id="precio"
                  step="0.01"
                  value={newProduct.precio}
                  onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="idCategoria" className="block mb-2 font-medium">
                  Categoría:
                </label>
                <select
                  id="idCategoria"
                  value={newProduct.idCategoria}
                  onChange={(e) => setNewProduct({ ...newProduct, idCategoria: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))
                  ) : (
                    <option value="">No hay categorías disponibles</option>
                  )}
                </select>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button type="submit" className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600">
                  Guardar Producto
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="px-4 mb-8 max-w-6xl mx-auto flex flex-wrap gap-4 justify-center">
        <a href="/gestion-admin" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Gestionar Categorías
        </a>
        <a href="/consultas" className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">
          Ver Consultas
        </a>
        <a href="/gestion-usuarios" className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600">
          Gestionar Usuarios
        </a>
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

export default ProductsPage

