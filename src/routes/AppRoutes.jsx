import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';

// Layout imports
import { MainLayout, CustomerLayout, FarmerLayout, AuthLayout } from '../layouts';

// Redesigned Pages (Step 4)
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Existing Pages (Incremental migration preservation)
import Products from '../components/products/products';
import Dashboard from '../components/dashboard/dashboard';
import Orders from '../OrderManagement/ordermanagement';
import FarmerProducts from '../components/inovetary/inovetory';
import AddProduct from '../components/products/addProduct';
import UpdateProduct from '../components/products/updateProduct';
import FarmerProfile from '../components/navbar/profile';
import { ProductsOnFarmer } from '../pages/productsonfarmer/FarmerProducts';

import CustomerHome from '../pages/customer/customerHome';
import ProductCatalog from '../pages/customer/ProductCatalog';
import ProductDetails from '../pages/customer/ProductDetails';
import FarmerStorefront from '../pages/customer/FarmerStorefront';
import AddressManagement from '../pages/customer/Addresses';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderHistory from '../pages/customer/OrderHistory';
import OrderDetails from '../pages/customer/OrderDetails';
import Farmers from '../pages/customer/Farmers';
import CustomerProfile from '../pages/customer/CustomerProfile';

export function AppRoutes() {
  return (
    <Routes>
      {/* ========================================================
          1. PUBLIC & AUTH ROUTES
          ======================================================== */}
      {/* Redesigned Premium Homepage */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/farmer" element={<ProductsOnFarmer />} />

      {/* Split-screen visual Auth Layout for Login and Register */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ========================================================
          2. FARMER PORTAL ROUTES (Protected: Role FARMER only)
          ======================================================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/products"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <FarmerProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/products/add"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/products/update/:pid"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <UpdateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
            <FarmerProfile />
          </ProtectedRoute>
        }
      />

      {/* ========================================================
          3. CUSTOMER PORTAL ROUTES (Protected / Customer Session)
          ======================================================== */}
      <Route path="/customer" element={<CustomerLayout />}>
        {/* Marketplace Home & Browse */}
        <Route path="home" element={<CustomerHome />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="products/farmer/:fid" element={<FarmerStorefront />} />
        <Route path="farmers" element={<Farmers />} />

        {/* Customer Actions (Protected: Role CUSTOMER only) */}
        <Route
          path="cart"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="addresses"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <AddressManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
