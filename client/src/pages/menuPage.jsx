import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productsService';
import orderService from '../services/orderService';
import authService from '../services/loginService'; 

function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoicePreview, setInvoicePreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación y rol
    const checkAuth = async () => {
      const userRole = authService.getUserRole();
      if (!authService.isAuthenticated() || userRole !== 'empleado') {
        alert('Acceso denegado');
        navigate('/');
        return;
      }
      // Cargar productos
      loadProducts();
    };

    checkAuth();

  }, [navigate]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      // Organizar productos por categoría
      const categorizedProducts = {};
      data.forEach(({ nombre_categoria, descripcion, precio, idProducto }) => {
        if (!categorizedProducts[nombre_categoria]) {
          categorizedProducts[nombre_categoria] = [];
        }
        categorizedProducts[nombre_categoria].push({ descripcion, precio, idProducto });
      });

      setCategories(categorizedProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleQuantityChange = (idProducto, nombre, precio, cantidad) => {
    const parsedCantidad = parseInt(cantidad);
    if (parsedCantidad <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.idProducto !== idProducto));
      return;
    }

    const existingProductIndex = selectedProducts.findIndex(p => p.idProducto === idProducto);

    if (existingProductIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        cantidad: parsedCantidad,
        subtotal: parsedCantidad * precio
      };
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          idProducto,
          nombre,
          precio,
          cantidad: parsedCantidad,
          subtotal: parsedCantidad * precio
        }
      ]);
    }
  };

  useEffect(() => {
    updateInvoicePreview();
  }, [selectedProducts, paymentMethod]);

  const updateInvoicePreview = () => {
    const total = selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);
    const fechaPedido = new Date().toLocaleString();
    let factura = `Factura Previa\nFecha: ${fechaPedido}\nMétodo de Pago: ${paymentMethod}\n\n`;
    factura += `Producto\tCantidad\tPrecio\tSubtotal\n`;
    factura += selectedProducts.map(p =>
      `${p.nombre}\t${p.cantidad}\t$${p.precio}\t$${p.subtotal.toFixed(2)}`
    ).join('\n');
    factura += `\n\nTotal a Pagar: $${total.toFixed(2)}`;

    setInvoicePreview(factura);
  };

  const handleSaveOrder = async () => {
    if (selectedProducts.length === 0) {
      alert('Por favor, seleccione al menos un producto antes de generar el pedido.');
      return;
    }
    if (!tableNumber) {
      alert('Por favor, ingrese el número de mesa.');
      return;
    }

    const confirmar = window.confirm('¿Está seguro de que desea realizar este pedido?');
    if (!confirmar) return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('No se ha encontrado el ID del empleado. Por favor, inicie sesión nuevamente.');
        navigate('/');
        return;
      }

      const result = await orderService.createOrder({
        idEmpleado: userId,
        num_mesa: tableNumber,
        productos: selectedProducts.map(p => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad
        })),
        metodoPago: paymentMethod
      });

      if (result.success) {
        alert(`Pedido guardado con éxito. ID del pedido: ${result.idPedido}`);
        // Limpiar el formulario
        setSelectedProducts([]);
        setTableNumber('');
        updateInvoicePreview();
      } else {
        alert('Error al guardar el pedido: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pedido');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Filtrar productos según término de búsqueda
  const filteredCategories = {};
  if (searchTerm) {
    Object.keys(categories).forEach(catName => {
      const filteredProducts = categories[catName].filter(product =>
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredProducts.length > 0) {
        filteredCategories[catName] = filteredProducts;
      }
    });
  } else {
    Object.assign(filteredCategories, categories);
  }

  const total = selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-blue-500 text-white py-5 px-4 text-center mb-8 shadow-md">
        <h1 className="text-2xl font-bold">`Bienvenidos al Menú</h1>
      </div>
      {/* Search Bar */}
      <div className="px-4 mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        />
      </div>

      {/* Menu Content */}
      <div className="flex flex-wrap gap-6 justify-center px-4 mb-8">
        {Object.keys(filteredCategories).map(categoryName => (
          <div key={categoryName} className="bg-white rounded-lg shadow-md p-5 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{categoryName}</h2>
            {filteredCategories[categoryName].map(product => (
              <div key={product.idProducto} className="bg-gray-100 border border-gray-300 rounded p-4 mb-4">
                <p className="mb-2">{product.descripcion} - ${product.precio}</p>
                <input
                  type="number"
                  min="0"
                  value={selectedProducts.find(p => p.idProducto === product.idProducto)?.cantidad || 0}
                  onChange={(e) => handleQuantityChange(
                    product.idProducto,
                    product.descripcion,
                    product.precio,
                    e.target.value
                  )}
                  className="w-16 p-2 text-center border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="flex flex-wrap gap-6 justify-center px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
          <div className="mb-4">
            {selectedProducts.map(product => (
              <p key={product.idProducto} className="mb-2">
                {product.nombre} x {product.cantidad} - ${product.subtotal.toFixed(2)}
              </p>
            ))}
            <p className="font-bold mt-4">Total: ${total.toFixed(2)}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="num_mesa" className="block mb-2 font-medium">Número de Mesa:</label>
            <input
              type="number"
              id="num_mesa"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              required
            />

            <label htmlFor="metodoPago" className="block mb-2 font-medium">Método de Pago:</label>
            <select
              id="metodoPago"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSaveOrder}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Guardar Pedido
            </button>
            <button
              onClick={() => navigate('/gestion-pedidos')}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Ver Pedidos
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-lg shadow-md p-5 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Vista Previa de la Factura</h2>
          <textarea
            value={invoicePreview}
            readOnly
            className="w-full h-64 p-3 border border-gray-300 rounded-md resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center py-5 bg-gray-800 text-white">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default MenuPage;