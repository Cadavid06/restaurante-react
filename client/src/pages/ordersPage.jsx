"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import orderService from "../services/orderService"
import productService from "../services/productsService"
import invoiceService from "../services/invoiceService"
import authService from "../services/loginService"

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [tableNumber, setTableNumber] = useState("")
  const [orderProducts, setOrderProducts] = useState([])
  const [newProductId, setNewProductId] = useState("")
  const [newProductQuantity, setNewProductQuantity] = useState(1)

  const ordersPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar autenticación y rol
    const checkAuth = async () => {
      const userRole = authService.getUserRole()
      if (!authService.isAuthenticated() || userRole !== "empleado") {
        alert("Acceso denegado")
        navigate("/")
        return
      }

      // Cargar datos
      loadOrders()
      loadProducts()
    }

    checkAuth()
  }, [navigate])

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders()
    }
  }, [searchTerm, orders, currentPage])

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts()
      setProducts(data)
      if (data.length > 0) {
        setNewProductId(data[0].id)
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
    }
  }

  const filterOrders = () => {
    const filtered = orders.filter(
      (order) =>
        order.idPedido.toString().includes(searchTerm) ||
        order.num_mesa.toString().includes(searchTerm) ||
        new Date(order.fechaPedido).toLocaleDateString().includes(searchTerm),
    )

    const startIndex = (currentPage - 1) * ordersPerPage
    const endIndex = startIndex + ordersPerPage
    setFilteredOrders(filtered.slice(startIndex, endIndex))
  }

  const handleEditOrder = async (orderId) => {
    try {
      const orderData = await orderService.getOrderById(orderId)
      setCurrentOrder(orderData)
      setTableNumber(orderData.num_mesa)
      setOrderProducts(orderData.productos || [])
      setShowEditModal(true)
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error)
      alert("Error al obtener detalles del pedido")
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este pedido?")) {
      try {
        await orderService.deleteOrder(orderId)
        alert("Pedido eliminado exitosamente")
        loadOrders()
      } catch (error) {
        console.error("Error al eliminar pedido:", error)
        alert("Error al eliminar pedido")
      }
    }
  }

  const handleGenerateInvoice = async (orderId) => {
    try {
      const result = await invoiceService.generateInvoice(orderId, "Efectivo")
      if (result.error) {
        if (result.error.includes("Ya existe una factura")) {
          alert(`Ya existe una factura para este pedido. ID de la factura: ${result.idFactura}`)
        } else {
          alert(`Error: ${result.error}`)
        }
      } else {
        alert(`Factura generada con éxito. ID de la factura: ${result.idFactura}`)
      }
    } catch (error) {
      console.error("Error al generar factura:", error)
      alert("Error al generar factura")
    }
  }

  const handleShowInvoice = async (orderId) => {
    try {
      const invoiceData = await invoiceService.getInvoice(orderId)
      if (!invoiceData) {
        alert("No se ha generado una factura para este pedido aún.")
        return
      }
      setCurrentInvoice(invoiceData)
      setShowInvoiceModal(true)
    } catch (error) {
      console.error("Error al obtener factura:", error)
      alert("Error al obtener factura")
    }
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()

    if (!currentOrder) return

    try {
      await orderService.updateOrder(currentOrder.idPedido, {
        num_mesa: tableNumber,
        productos: orderProducts.map((p) => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad,
        })),
      })

      alert("Pedido actualizado exitosamente")
      setShowEditModal(false)
      loadOrders()
    } catch (error) {
      console.error("Error al actualizar pedido:", error)
      alert("Error al actualizar pedido")
    }
  }

  const handleAddProduct = () => {
    if (!newProductId) return

    const product = products.find((p) => p.id === newProductId)
    if (!product) return

    const existingProductIndex = orderProducts.findIndex((p) => p.idProducto === newProductId)

    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const updatedProducts = [...orderProducts]
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        cantidad: Number.parseInt(updatedProducts[existingProductIndex].cantidad) + Number.parseInt(newProductQuantity),
      }
      setOrderProducts(updatedProducts)
    } else {
      // Add new product
      setOrderProducts([
        ...orderProducts,
        {
          idProducto: newProductId,
          descripcion: product.descripcion,
          cantidad: Number.parseInt(newProductQuantity),
        },
      ])
    }

    setNewProductQuantity(1)
  }

  const handleRemoveProduct = (productId) => {
    setOrderProducts(orderProducts.filter((p) => p.idProducto !== productId))
  }

  const handleProductQuantityChange = (productId, quantity) => {
    const updatedProducts = orderProducts.map((p) =>
      p.idProducto === productId ? { ...p, cantidad: Number.parseInt(quantity) } : p,
    )
    setOrderProducts(updatedProducts)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const totalPages = Math.ceil(orders.length / ordersPerPage)

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-blue-500 text-white py-5 px-4 text-center mb-8 shadow-md">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6 max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="Buscar pedido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        />
      </div>

      {/* Orders Table */}
      <div className="px-4 mb-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-500 text-white p-3 text-left">ID Pedido</th>
                <th className="bg-blue-500 text-white p-3 text-left">Fecha Pedido</th>
                <th className="bg-blue-500 text-white p-3 text-left">ID Empleado</th>
                <th className="bg-blue-500 text-white p-3 text-left">Número de Mesa</th>
                <th className="bg-blue-500 text-white p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.idPedido} className="hover:bg-gray-100">
                  <td className="border-b p-3">{order.idPedido}</td>
                  <td className="border-b p-3">{new Date(order.fechaPedido).toLocaleDateString()}</td>
                  <td className="border-b p-3">{order.idEmpleado}</td>
                  <td className="border-b p-3">{order.num_mesa}</td>
                  <td className="border-b p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditOrder(order.idPedido)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.idPedido)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(order.idPedido)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Generar Factura
                      </button>
                      <button
                        onClick={() => handleShowInvoice(order.idPedido)}
                        className="bg-purple-500 text-white px-2 py-1 rounded text-sm hover:bg-purple-600"
                      >
                        Mostrar Factura
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Pedido</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <p className="text-gray-700">
                <strong>ID Pedido:</strong> {currentOrder?.idPedido}
              </p>
              <p className="text-gray-700">
                <strong>Fecha Pedido:</strong> {new Date(currentOrder?.fechaPedido).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <strong>ID Empleado:</strong> {currentOrder?.idEmpleado}
              </p>

              <div>
                <label htmlFor="editNumMesa" className="block mb-2 font-medium">
                  Número de Mesa:
                </label>
                <input
                  type="number"
                  id="editNumMesa"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <h3 className="text-lg font-bold mt-4">Productos del Pedido</h3>
              <div className="space-y-3">
                {orderProducts.map((product) => (
                  <div key={product.idProducto} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <select
                      value={product.idProducto}
                      onChange={(e) => {
                        const newProductId = e.target.value
                        const newProduct = products.find((p) => p.id === newProductId)
                        if (newProduct) {
                          handleProductQuantityChange(product.idProducto, product.cantidad)
                          handleRemoveProduct(product.idProducto)
                          setOrderProducts([
                            ...orderProducts.filter((p) => p.idProducto !== product.idProducto),
                            {
                              idProducto: newProductId,
                              descripcion: newProduct.descripcion,
                              cantidad: product.cantidad,
                            },
                          ])
                        }
                      }}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.descripcion} - ${p.precio}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={product.cantidad}
                      onChange={(e) => handleProductQuantityChange(product.idProducto, e.target.value)}
                      className="w-20 p-2 border border-gray-300 rounded-md text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.idProducto)}
                      className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold mt-4">Añadir productos</h3>
              <div className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 rounded-md">
                <div className="flex-grow">
                  <label htmlFor="productSelect" className="block mb-2 font-medium">
                    Producto:
                  </label>
                  <select
                    id="productSelect"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.descripcion} - ${product.precio}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="productQuantity" className="block mb-2 font-medium">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    id="productQuantity"
                    min="1"
                    value={newProductQuantity}
                    onChange={(e) => setNewProductQuantity(e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Añadir Producto
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button type="submit" className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Información de la Factura</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p>
                <strong>ID Factura:</strong> {currentInvoice.idFactura}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(currentInvoice.fechaFactura).toLocaleDateString()}
              </p>
              <p>
                <strong>Método de Pago:</strong> {currentInvoice.metodoPago}
              </p>
              <p>
                <strong>Número de Mesa:</strong> {currentInvoice.num_mesa}
              </p>

              <h3 className="text-lg font-bold">Productos:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {currentInvoice.productos.map((producto, index) => {
                  const subtotal = producto.cantidad * producto.precio
                  return (
                    <li key={index}>
                      {producto.descripcion} - Cantidad: {producto.cantidad} - Precio: ${producto.precio.toFixed(2)} -
                      Subtotal: ${subtotal.toFixed(2)}
                    </li>
                  )
                })}
              </ul>

              <p className="text-xl font-bold mt-4">Total: ${currentInvoice.totalPago.toFixed(2)}</p>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => invoiceService.downloadInvoicePDF(currentInvoice.idFactura)}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 text-center py-5 bg-gray-800 text-white">
        <div className="mb-4">
          <a href="/menu" className="text-blue-400 hover:text-blue-300">
            Regresar al menú
          </a>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default OrdersPage

