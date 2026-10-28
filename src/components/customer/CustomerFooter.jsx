import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function CustomerFooter() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto border-top border-success border-opacity-25">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-tree-fill text-success fs-3"></i>
              <span className="fs-4 fw-bold text-white">Kisan<span className="text-warning">Connect</span></span>
            </div>
            <p className="text-success fs-8 lh-base">
              Empowering local farmers by connecting them directly with consumers. Fresh, organic, and sustainably grown agricultural produce delivered straight from the farm to your doorstep.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#facebook" className="text-white-50 hover-success fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#twitter" className="text-white-50 hover-success fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#instagram" className="text-white-50 hover-success fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#whatsapp" className="text-white-50 hover-success fs-5"><i className="bi bi-whatsapp"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-success mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 fs-8">
              <li><Link to="/customer/home" className="text-decoration-none text-light hover-white">Home</Link></li>
              <li><Link to="/customer/products" className="text-decoration-none text-light hover-white">Browse Products</Link></li>
              <li><Link to="/customer/farmers" className="text-decoration-none text-light hover-white">Explore Farmers</Link></li>
              <li><Link to="/customer/cart" className="text-decoration-none text-light hover-white">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Customer Account */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-success mb-3">My Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 fs-8">
              <li><Link to="/customer/profile" className="text-decoration-none text-light hover-white">Profile Settings</Link></li>
              <li><Link to="/customer/orders" className="text-decoration-none text-light hover-white">Order History</Link></li>
              <li><Link to="/customer/addresses" className="text-decoration-none text-light hover-white">Delivery Addresses</Link></li>
              <li><Link to="/customer/wishlist" className="text-decoration-none text-light hover-white">Wishlist</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-success mb-3">Agricultural Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 fs-8">
              <li><i className="bi bi-geo-alt  me-2 text-success" ></i> Kisan Bhavan, Agri-Tech Hub, India</li>
              <li><i className="bi bi-telephone text-success me-2"></i> +91 1800-KISAN-CONNECT</li>
              <li><i className="bi bi-envelope text-success me-2"></i> support@kisanconnect.org</li>
              <li><i className="bi bi-clock text-success me-2"></i> Mon - Sat: 8:00 AM - 7:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-top border-secondary border-opacity-25 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center fs-8 text-muted">
          <p className="mb-2 mb-md-0">&copy; {new Date().getFullYear()} KisanConnect. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#privacy" className="text-decoration-none text-muted">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#terms" className="text-decoration-none text-muted">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}