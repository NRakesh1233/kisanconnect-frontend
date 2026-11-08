import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function CustomerFooter() {
  return (
    <footer className="footer-container text-light pt-4 pb-5 mt-auto border-top border-success border-opacity-25 position-relative overflow-hidden" style={{ background: '#0d1310' }}>
      <div className="container position-relative z-1 mb-5 pb-4" style={{ maxWidth: '1200px' }}>
        <div className="row g-4 mb-3">
          
          {/* Brand Info & Socials */}
          <div className="col-lg-4 col-md-12 mb-2">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-tree-fill text-success fs-4"></i>
              <span className="fs-5 fw-bold text-white">Kisan<span className="text-success">Connect</span></span>
            </div>
            <p className="text-light fs-7 opacity-90 lh-sm mb-3" style={{ fontSize: '0.82rem', maxWidth: '350px' }}>
              Empowering local farmers by connecting them directly with consumers. Fresh, organic farm produce delivered to your doorstep.
            </p>
            
            {/* Social Icons using Inline SVGs for guaranteed visibility */}
            <div className="d-flex gap-2 mb-3">
              {/* Facebook */}
              <a href="#facebook" className="text-success  bg-light bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center text-decoration-none" style={{ width: '34px', height: '34px' }} title="Facebook">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
              </a>
              {/* Twitter / X */}
              <a href="#twitter" className="text-success  bg-light bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center text-decoration-none" style={{ width: '34px', height: '34px' }} title="Twitter">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6 0.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#instagram" className="text-success  bg-light bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center text-decoration-none" style={{ width: '34px', height: '34px' }} title="Instagram">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.668 2.668 0 1 1 0 5.335 2.668 2.668 0 0 1 0-5.335z"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="#whatsapp" className="text-success bg-light bg-opacity-15 rounded-circle d-flex align-items-center justify-content-center text-decoration-none" style={{ width: '34px', height: '34px' }} title="WhatsApp">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.558 6.558 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.348.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34l-.38-.008c-.133 0-.36.05-.548.248-.187.198-.714.698-.714 1.705 0 1.006.734 1.977.836 2.113.103.133 1.44 2.203 3.487 3.091.488.21.868.335 1.163.431.49.156.933.133 1.282.08.39-.058 1.17-.478 1.338-.94.17-.46.17-.855.119-.938-.05-.083-.183-.133-.38-.23z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2 col-md-4">
            <h6 className="fw-bold text-success mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-1.5 mb-0" style={{ fontSize: '0.82rem' }}>
              <li><Link to="/customer/home" className="text-decoration-none text-light opacity-90 fw-medium">Home</Link></li>
              <li><Link to="/customer/products" className="text-decoration-none text-light opacity-90 fw-medium">Products</Link></li>
              <li><Link to="/customer/farmers" className="text-decoration-none text-light opacity-90 fw-medium">Farmers</Link></li>
              <li><Link to="/customer/cart" className="text-decoration-none text-light opacity-90 fw-medium">Cart</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div className="col-6 col-lg-2 col-md-4">
            <h6 className="fw-bold text-success mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>My Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-1.5 mb-0" style={{ fontSize: '0.82rem' }}>
              <li><Link to="/customer/profile" className="text-decoration-none text-light opacity-90 fw-medium">Profile</Link></li>
              <li><Link to="/customer/orders" className="text-decoration-none text-light opacity-90 fw-medium">Orders</Link></li>
              <li><Link to="/customer/addresses" className="text-decoration-none text-light opacity-90 fw-medium">Addresses</Link></li>
              <li><Link to="/customer/wishlist" className="text-decoration-none text-light opacity-90 fw-medium">Wishlist</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-12 col-lg-4 col-md-4 mt-3 mt-lg-0">
            <h6 className="fw-bold text-success mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-1.5 mb-0 text-light opacity-90" style={{ fontSize: '0.8rem' }}>
              <li className="d-flex align-items-center gap-2"><i className="bi bi-geo-alt text-success"></i> <span>Kisan Bhavan, Agri-Tech Hub, India</span></li>
              <li className="d-flex align-items-center gap-2"><i className="bi bi-telephone text-success"></i> <span>+91 1800-KISAN-CONNECT</span></li>
              <li className="d-flex align-items-center gap-2"><i className="bi bi-envelope text-success"></i> <span>support@kisanconnect.org</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-top border-success border-opacity-15 pt-3 mt-3 text-center text-light opacity-75" style={{ fontSize: '0.72rem' }}>
          <p className="mb-0">&copy; {new Date().getFullYear()} KisanConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}