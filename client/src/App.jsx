import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/loginPage"
import RegisterPage from "./pages/registerPage"
import ProductsPage from "./pages/productsPage"
import MenuPage from "./pages/menuPage"
import AdminPage from "./pages/adminPages"
import OrdersPage from "./pages/ordersPage"
import NewUserPage from "./pages/newUserPage"
import QueriesPage from "./pages/queriesPages"
import authService from "./services/loginService"

// Componente para rutas protegidas
const ProtectedRoute = ({ element, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated()
  const userRole = authService.getUserRole()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return element
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/agg_products"
          element={<ProtectedRoute element={<ProductsPage />} requiredRole="administrador" />}
        />
        <Route path="/menu" element={<ProtectedRoute element={<MenuPage />} requiredRole="empleado" />} />
        <Route
          path="/gestion-admin"
          element={<ProtectedRoute element={<AdminPage />} requiredRole="administrador" />}
        />
        <Route path="/gestion-pedidos" element={<ProtectedRoute element={<OrdersPage />} requiredRole="empleado" />} />
        <Route
          path="/gestion-usuarios"
          element={<ProtectedRoute element={<NewUserPage />} requiredRole="administrador" />}
        />
        <Route path="/consultas" element={<ProtectedRoute element={<QueriesPage />} requiredRole="administrador" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

