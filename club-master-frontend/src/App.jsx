import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import StaffLayout from './components/layout/StaffLayout';

import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Guest from './pages/auth/Guest';
import MesaSelect from './pages/client/MesaSelect';
import ClientHome from './pages/client/Home';
import Products from './pages/client/Products';
import Cart from './pages/client/Cart';
import Payment from './pages/client/Payment';
import Tracking from './pages/client/Tracking';
import StaffDashboard from './pages/staff/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminModule from './pages/admin/AdminModule';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/invitado" element={<Guest />} />

            <Route path="/mesa" element={
              <ProtectedRoute roles={['cliente']}>
                <MesaSelect />
              </ProtectedRoute>
            } />

            <Route path="/cliente" element={
              <ProtectedRoute roles={['cliente']}>
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ClientHome />} />
              <Route path="productos" element={<Products />} />
              <Route path="carrito" element={<Cart />} />
              <Route path="pago" element={<Payment />} />
              <Route path="seguimiento" element={<Tracking />} />
            </Route>

            <Route path="/staff" element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffDashboard />} />
            </Route>

            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminModule title="Productos" description="Gestión del menú y precios" />} />
              <Route path="categorias" element={<AdminModule title="Categorías" description="Organización del menú" />} />
              <Route path="inventario" element={<AdminModule title="Inventario" description="Control de stock" />} />
              <Route path="promociones" element={<AdminModule title="Promociones" description="Ofertas y descuentos" />} />
              <Route path="reservas" element={<AdminModule title="Reservas" description="Gestión de reservaciones" />} />
              <Route path="mesas" element={<AdminModule title="Mesas" description="Configuración de mesas y QR" />} />
              <Route path="usuarios" element={<AdminModule title="Usuarios" description="Clientes registrados" />} />
              <Route path="staff" element={<AdminModule title="Staff" description="Personal operativo" />} />
              <Route path="pedidos" element={<AdminModule title="Pedidos" description="Historial de pedidos" />} />
              <Route path="pagos" element={<AdminModule title="Pagos" description="Transacciones y métodos de pago" />} />
              <Route path="reportes" element={<AdminModule title="Reportes" description="Análisis y métricas" />} />
              <Route path="configuracion" element={<AdminModule title="Configuración" description="Ajustes del negocio" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
