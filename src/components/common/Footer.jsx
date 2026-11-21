import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="pt-5 pb-4 mt-auto" style={{ backgroundColor: 'var(--kc-forest-green)', color: 'var(--kc-cream)' }}>
      <div className="kc-container">
        {/* Top Feature Badges */}
        <div className="row g-4 pb-5 mb-5 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <div className="col-md-4 col-sm-6 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: '50px', height: '50px', backgroundColor: 'var(--kc-fresh-green)', flexShrink: 0 }}
            >
              <i className="bi bi-patch-check fs-4"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">100% Certified Organic</h6>
              <small style={{ color: 'var(--kc-beige)' }}>Cultivated naturally without synthetic chemicals.</small>
            </div>
          </div>

          <div className="col-md-4 col-sm-6 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: '50px', height: '50px', backgroundColor: 'var(--kc-fresh-green)', flexShrink: 0 }}
            >
              <i className="bi bi-wallet2 fs-4"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">Fair Direct Payouts</h6>
              <small style={{ color: 'var(--kc-beige)' }}>100% transparent pricing directly reaching farmers.</small>
            </div>
          </div>

          <div className="col-md-4 col-sm-12 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: '50px', height: '50px', backgroundColor: 'var(--kc-fresh-green)', flexShrink: 0 }}
            >
              <i className="bi bi-truck fs-4"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">Farm-to-Door Delivery</h6>
              <small style={{ color: 'var(--kc-beige)' }}>Carefully packed at the harvest site for max freshness.</small>
            </div>
          </div>
        </div>

        {/* Main 4-Column Links */}
        <div className="row g-4 mb-5">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '36px', height: '36px', backgroundColor: 'var(--kc-fresh-green)' }}
              >
                <i className="bi bi-flower2"></i>
              </div>
              <span className="fs-4 fw-bold text-white">
                Kisan<span style={{ color: 'var(--kc-fresh-green)' }}>Connect</span>
              </span>
            </div>
            <p className="small mb-4" style={{ color: 'var(--kc-beige)', maxWidth: '340px' }}>
              Empowering local agricultural stewards with modern transparent commerce. Fresh, wholesome food straight from honest hands to your kitchen table.
            </p>
            <div className="d-flex gap-2">
              <a href="#facebook" className="kc-icon-btn" style={{ width: '36px', height: '36px' }} title="Facebook">
                <i className="bi bi-facebook fs-6"></i>
              </a>
              <a href="#instagram" className="kc-icon-btn" style={{ width: '36px', height: '36px' }} title="Instagram">
                <i className="bi bi-instagram fs-6"></i>
              </a>
              <a href="#whatsapp" className="kc-icon-btn" style={{ width: '36px', height: '36px' }} title="WhatsApp">
                <i className="bi bi-whatsapp fs-6"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white text-uppercase mb-3 small" style={{ letterSpacing: '0.05em' }}>
              Marketplace
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/customer/products" style={{ color: 'var(--kc-beige)' }}>Organic Vegetables</Link>
              </li>
              <li>
                <Link to="/customer/products" style={{ color: 'var(--kc-beige)' }}>Fresh Fruits</Link>
              </li>
              <li>
                <Link to="/customer/products" style={{ color: 'var(--kc-beige)' }}>Wholesome Grains</Link>
              </li>
              <li>
                <Link to="/customer/farmers" style={{ color: 'var(--kc-beige)' }}>Certified Farmers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="fw-bold text-white text-uppercase mb-3 small" style={{ letterSpacing: '0.05em' }}>
              Account & Orders
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/customer/orders" style={{ color: 'var(--kc-beige)' }}>Track Orders</Link>
              </li>
              <li>
                <Link to="/customer/cart" style={{ color: 'var(--kc-beige)' }}>Shopping Cart</Link>
              </li>
              <li>
                <Link to="/customer/addresses" style={{ color: 'var(--kc-beige)' }}>Delivery Addresses</Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: 'var(--kc-beige)' }}>Farmer Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Direct Farmer Guarantee */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white text-uppercase mb-3 small" style={{ letterSpacing: '0.05em' }}>
              Farmer Trust
            </h6>
            <p className="small mb-3" style={{ color: 'var(--kc-beige)' }}>
              Join over 10,000+ households receiving verified direct-from-soil agricultural produce every week.
            </p>
            <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              <span className="badge kc-badge-organic text-dark mb-1 text-dark">Zero Middlemen</span>
              <p className="small text-white-50 mb-0">100% of purchase proceeds directly support sustainable family farming.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small" style={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: 'var(--kc-beige)' }}>
          <p className="mb-0">© {new Date().getFullYear()} KisanConnect. All rights reserved.</p>
          <div className="d-flex gap-4">
            <Link to="/products" style={{ color: 'var(--kc-beige)' }}>Privacy Policy</Link>
            <Link to="/products" style={{ color: 'var(--kc-beige)' }}>Terms of Service</Link>
            <Link to="/login" style={{ color: 'var(--kc-beige)' }}>Partner Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
