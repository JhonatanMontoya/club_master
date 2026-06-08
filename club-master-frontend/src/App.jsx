import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MesaSessionGuard from './components/auth/MesaSessionGuard';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import StaffLayout from './components/layout/StaffLayout';

import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Guest from './pages/auth/Guest';
import MesaSelect from './pages/client/MesaSelect';
import PedidoEspera from './pages/client/PedidoEspera';
import ClientHome from './pages/client/Home';
import Products from './pages/client/Products';
import Cart from './pages/client/Cart';
import Payment from './pages/client/Payment';
import Tracking from './pages/client/Tracking';
import StaffDashboard from './pages/staff/Dashboard';
import StaffNuevoPedido from './pages/staff/NuevoPedido';
import StaffMesas from './pages/staff/MesasStaff';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProductos from './pages/admin/Productos';
import AdminCategorias from './pages/admin/Categorias';
import AdminInventario from './pages/admin/Inventario';
import AdminPromociones from './pages/admin/Promociones';
import AdminReservas from './pages/admin/Reservas';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminStaff from './pages/admin/Staff';
import AdminPedidos from './pages/admin/Pedidos';
import AdminPagos from './pages/admin/Pagos';
import AdminReportes from './pages/admin/Reportes';
import AdminConfiguracion from './pages/admin/Configuracion';
import AdminMesas from './pages/admin/Mesas';

function App() {
  return (
    <SiteConfigProvider>
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
                <MesaSessionGuard>
                  <ClientLayout />
                </MesaSessionGuard>
              </ProtectedRoute>
            }>
              <Route index element={<ClientHome />} />
              <Route path="productos" element={<Products />} />
              <Route path="carrito" element={<Cart />} />
              <Route path="pago" element={<Payment />} />
              <Route path="seguimiento" element={<Tracking />} />
              <Route path="espera-pedido" element={<PedidoEspera />} />
            </Route>

            <Route path="/staff" element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffDashboard />} />
              <Route path="nuevo-pedido" element={<StaffNuevoPedido />} />
              <Route path="mesas" element={<StaffMesas />} />
            </Route>

            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="categorias" element={<AdminCategorias />} />
              <Route path="inventario" element={<AdminInventario />} />
              <Route path="promociones" element={<AdminPromociones />} />
              <Route path="reservas" element={<AdminReservas />} />
              <Route path="mesas" element={<AdminMesas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="pagos" element={<AdminPagos />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="configuracion" element={<AdminConfiguracion />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </SiteConfigProvider>
  );
}

export default App;
