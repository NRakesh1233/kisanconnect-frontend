import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Home } from "./components/home/home";
import { Login } from "./components/login/login";
import { Register } from "./components/register/register";
import Products from "./components/products/products";
import Dashboard from "./components/dashboard/dashboard";
import Orders from "./OrderManagement/ordermanagement";
import FarmerProducts from "./components/inovetary/inovetory";
import AddProduct from "./components/products/addProduct";
import UpdateProduct from "./components/products/updateProduct";
import FarmerProfile from "./components/navbar/profile";
import { ProductsOnFarmer } from "./pages/productsonfarmer/FarmerProducts.jsx";

import CustomerHome from "./pages/customer/customerHome.jsx";
import ProductCatalog from "./pages/customer/ProductCatalog.jsx";
import ProductDetails from "./pages/customer/ProductDetails.jsx";
import FarmerStorefront from "./pages/customer/FarmerStorefront.jsx";
import AddressManagement from "./pages/customer/Addresses.jsx";
import Cart from "./pages/customer/Cart.jsx";
import Checkout from "./pages/customer/Checkout.jsx";
import OrderHistory from "./pages/customer/OrderHistory.jsx";
import OrderDetails from "./pages/customer/OrderDetails.jsx";
import Farmers from "./pages/customer/Farmers.jsx";
import CustomerProfile from "./pages/customer/CustomerProfile.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// 1. Create a Layout component that wraps its children in the CartProvider
function CustomerLayout() {
  return (
    <CartProvider>
      <Outlet /> 
    </CartProvider>
  );
}

function Layout() {
  return (
    <Routes>
      {/* General & Farmer Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/farmer" element={<ProductsOnFarmer />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/orders" element={<Orders />} />
      <Route path="/dashboard/products" element={<FarmerProducts />} />
      <Route path="/dashboard/products/add" element={<AddProduct />} />
      <Route path="/dashboard/products/update/:pid" element={<UpdateProduct />} />
      <Route path="/dashboard/profile" element={<FarmerProfile />} />

      {/* Customer Routes (Nested inside CustomerLayout to get Context) */}
      <Route path="/customer" element={<CustomerLayout />}>
        {/* Notice how the child paths drop the "/customer" prefix */}
        <Route path="home" element={<CustomerHome />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/farmer/:fid" element={<FarmerStorefront />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="addresses" element={<AddressManagement />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="farmers" element={<Farmers />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>
    </Routes>
  );
}

export function Index() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}