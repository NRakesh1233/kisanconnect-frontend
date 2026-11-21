import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: 'var(--kc-cream)' }}>
      <div className="container-fluid p-0">
        <div className="row g-0 min-vh-100">
          {/* Left: Premium Agricultural Visual Showcase (Desktop) */}
          <div
            className="col-lg-5 col-xl-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(22, 61, 43, 0.88), rgba(22, 61, 43, 0.94)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Ambient Leaf Watermark */}
            <div
              className="position-absolute end-0 bottom-0 text-white opacity-10"
              style={{ fontSize: '24rem', lineHeight: 0, transform: 'translate(20%, 20%)', pointerEvents: 'none' }}
            >
              <i className="bi bi-flower2"></i>
            </div>

            {/* Brand Header */}
            <div className="position-relative z-1">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-white text-decoration-none">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px', backgroundColor: 'var(--kc-fresh-green)' }}
                >
                  <i className="bi bi-flower2 fs-5"></i>
                </div>
                <span className="fs-3 fw-bold">
                  Kisan<span style={{ color: 'var(--kc-fresh-green)' }}>Connect</span>
                </span>
              </Link>
            </div>

            {/* Middle Feature Highlights */}
            <div className="position-relative z-1 my-5" style={{ maxWidth: '480px' }}>
              <span className="badge kc-badge-organic text-dark mb-3">
                <i className="bi bi-stars"></i> Direct Farm-to-Table Marketplace
              </span>
              <h1 className="display-6 fw-extrabold mb-3 text-white">
                Empowering the Hands that Feed India.
              </h1>
              <p className="lead fs-6 text-white-50 mb-4">
                Connect directly with certified organic growers. Transparent pricing, pristine freshness, and zero unnecessary intermediaries.
              </p>

              <div className="d-flex flex-column gap-2.5">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span className="small text-white">100% Traceable Harvest Lineage</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span className="small text-white">Fair Payouts Direct to Farmer Accounts</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span className="small text-white">Certified Organic and Chemical-Free Crops</span>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial / Community Quote */}
            <div
              className="position-relative z-1 p-3.5 rounded-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                <i className="bi bi-star-fill small"></i>
                <i className="bi bi-star-fill small"></i>
                <i className="bi bi-star-fill small"></i>
                <i className="bi bi-star-fill small"></i>
                <i className="bi bi-star-fill small"></i>
                <span className="text-white small fw-bold ms-1">4.9 / 5 Trust Score</span>
              </div>
              <p className="small text-white-50 mb-0 fst-italic">
                "KisanConnect removed the market uncertainty for our entire cooperative. Now we harvest with confidence."
              </p>
            </div>
          </div>

          {/* Right: Form Container */}
          <div className="col-lg-7 col-xl-6 d-flex align-items-center justify-content-center p-4 p-md-5">
            <div className="w-100" style={{ maxWidth: '480px' }}>
              <div className="text-center d-lg-none mb-4">
                <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: '38px', height: '38px', backgroundColor: 'var(--kc-forest-green)' }}
                  >
                    <i className="bi bi-flower2"></i>
                  </div>
                  <span className="fs-4 fw-bold text-dark">
                    Kisan<span className="text-success">Connect</span>
                  </span>
                </Link>
              </div>

              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
