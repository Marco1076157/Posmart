//File: src/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { CartProvider } from './context/CartProvider';
import OrderSuccess from './pages/OrderSuccess';

const router = createBrowserRouter([
  { path: '/', element: <CatalogPage />},
  { path: '/login', element: <LoginPage />},
  { path: '/register', element: <RegisterPage />},
  { path: '/dashboard', element: <DashboardPage />},
  { path: '/OrderSuccess', element: <OrderSuccess />}
]);

export default function App() {
  return(
    <CartProvider>
     <RouterProvider router={router} />
    </CartProvider>
  )
}