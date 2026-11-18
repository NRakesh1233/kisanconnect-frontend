import './home.css';
import '../navbar/common.css';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Navbar } from '../navbar/navbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [getTop4, setTop4] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const categoryRef = useRef(null);
  const freshRef = useRef(null);
  const diffRef = useRef(null);
  const stepsRef = useRef(null);
  const supportRef = useRef(null);

  const bannerSlides = [
    {
      badge: "Direct Farm to Table",
      subtitle: "Return up to 100% organic freshness * per harvest",
      title: "Fresh Organic Produce, Straight From Farms",
      desc: "Take control of your healthy lifestyle with farm-direct vegetables, grains, and fruits delivered straight to your doorstep right from local organic stewards.",
      img: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200"
    },
    {
      badge: "Sustainable Agriculture",
      subtitle: "Grown with zero synthetic chemicals",
      title: "Harvested Strictly With Sustainable Care",
      desc: "Experience nutrient-rich vegetables and seasonal fruits grown by trusted local agricultural partners dedicated to earth-friendly farming.",
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=1200"
    },
    {
      badge: "Lightning Fast Logistics",
      subtitle: "Rapid soil-to-doorstep delivery",
      title: "From Soil to Doorstep in Record Time",
      desc: "Our streamlined farm-to-table delivery network ensures your organic goods arrive crisp, fresh, and packed with farm-fresh nutrients.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkPnOFRzr4wEzP6VKFX_iVKp0YXOzykQLg_ZRrGDhEyIdSVHb9SthpJZrVDloVeWafA53mAK2AMJWzcuNdAz-xuKH_FFMHPNEwlLkpBkzLsKPOyqGYwHLAyRJ6on6i-c9OghkFKOCaWiW87v0-ArAyQtVn0CSvPTRjqu0M2w-40zdoFWsm3jgAnBkuXGlALbaLwqru9KiohA2g9DiUGVHsKBHagL-XAuAxgeArzQ1VqCETxEZEkYje"
    }
  ];

  function getProducts4() {
    axios.get(`${BASE_URL}/public/products/top4`)
      .then((p) => setTop4(p.data))
      .catch((err) => console.error("Error fetching top 4 products:", err));
  }

  useEffect(() => {
    getProducts4();

    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);

    const ctx = gsap.context(() => {
      // Cinematic entrance
      gsap.from(".hero-slide-anim > *", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out"
      });

      // Section scroll triggers
      gsap.from(".reveal-section", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    });

    return () => {
      clearInterval(interval);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <Navbar menu={["Home", "About", "Login", "Register"]} />
      
      <div ref={containerRef} className='kc-immersive-wrapper min-vh-100 position-relative overflow-hidden'>
        
        {/* Ambient Glowing Glass Orbs */}
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>

        {/* 1. DRIBBBLE-INSPIRED HERO SECTION BANNER */}
        <section ref={heroRef} className="container-fluid px-3 px-lg-5 pt-5 mt-4 position-relative z-1">
          <div className="kisan-hero-banner position-relative overflow-hidden rounded-5 shadow-2xl" style={{ minHeight: '540px' }}>
            
            {/* Background Image with Dark Gradient Overlay */}
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(15, 23, 18, 0.92) 0%, rgba(15, 23, 18, 0.75) 50%, rgba(15, 23, 18, 0.4) 100%), url('${bannerSlides[activeBanner].img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.8s ease-in-out',
                zIndex: 1
              }}
            ></div>

            {/* Hero Main Content */}
            <div className="container-xxl position-relative z-2 py-5 px-4 px-lg-5 d-flex flex-column justify-content-center" style={{ minHeight: '460px' }}>
              <div className="row align-items-center">
                <div className="col-lg-7 text-white py-4 hero-slide-anim">
                  <span className="d-block text-success fw-semibold small mb-2 tracking-wider">
                    {bannerSlides[activeBanner].subtitle}
                  </span>
                  <h1 className="display-4 fw-extrabold text-white mb-3 lh-tight tracking-tight">
                    {bannerSlides[activeBanner].title}
                  </h1>
                  <p className="text-light opacity-85 fs-6 mb-4 lh-base" style={{ maxWidth: '560px' }}>
                    {bannerSlides[activeBanner].desc}
                  </p>
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <Link to="/customer/home" className="text-decoration-none">
                      <button className="btn btn-success btn-lg px-4.5 py-3 rounded-pill fw-bold shadow-hover d-flex align-items-center gap-2">
                        <span>EXPLORE MARKETPLACE</span> <i className="bi bi-arrow-right"></i>
                      </button>
                    </Link>
                    <Link to="/dashboard" className="text-decoration-none">
                      <button className="btn btn-outline-light btn-lg px-4.5 py-3 rounded-pill fw-semibold shadow-hover d-flex align-items-center gap-2 bg-white bg-opacity-10 backdrop-blur">
                        <i className="bi bi-play-circle-fill text-success fs-5"></i> <span>Watch Farmer Story</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Bottom Cards (Dribbble Style Ticker) */}
            <div className="position-relative z-2 px-4 pb-4 d-none d-lg-block">
              <div className="row g-3">
                
                <div className="col">
                  <div className="card border-0 shadow-lg rounded-4 p-3.5 bg-white bg-opacity-95 backdrop-blur transition-hover">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-success bg-opacity-15 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-6">eco</span>
                        </div>
                        <span className="fw-bold text-dark small">Organic Veggies</span>
                      </div>
                      <span className="text-success small fw-bold">+16.5% fresh</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Harvested Today</div>
                    <div className="fw-bold text-dark fs-6 mt-1">₹35 / kg avg</div>
                  </div>
                </div>

                <div className="col">
                  <div className="card border-0 shadow-lg rounded-4 p-3.5 bg-white bg-opacity-95 backdrop-blur transition-hover">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-warning bg-opacity-15 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-6">nutrition</span>
                        </div>
                        <span className="fw-bold text-dark small">Seasonal Fruits</span>
                      </div>
                      <span className="text-success small fw-bold">+18.2% organic</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Direct from Farms</div>
                    <div className="fw-bold text-dark fs-6 mt-1">₹55 / kg avg</div>
                  </div>
                </div>

                <div className="col">
                  <div className="card border-0 shadow-lg rounded-4 p-3.5 bg-white bg-opacity-95 backdrop-blur transition-hover">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-success bg-opacity-15 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-6">verified</span>
                        </div>
                        <span className="fw-bold text-dark small">Verified Farmers</span>
                      </div>
                      <span className="text-success small fw-bold">100% Secure</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Active Partners</div>
                    <div className="fw-bold text-dark fs-6 mt-1">450+ Stewards</div>
                  </div>
                </div>

                <div className="col">
                  <div className="card border-0 shadow-lg rounded-4 p-3.5 bg-white bg-opacity-95 backdrop-blur transition-hover">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-info bg-opacity-15 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-6">local_shipping</span>
                        </div>
                        <span className="fw-bold text-dark small">Fast Delivery</span>
                      </div>
                      <span className="text-success small fw-bold">Live Transit</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Doorstep Transit</div>
                    <div className="fw-bold text-dark fs-6 mt-1">Within 24 Hours</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Banner Indicators */}
            <div className="position-absolute bottom-0 end-0 m-4 z-3 d-flex gap-2 p-2 rounded-pill bg-dark bg-opacity-25 backdrop-blur">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`rounded-pill border-0 transition-all ${activeBanner === idx ? 'bg-success active-dot' : 'bg-white bg-opacity-50'}`}
                  style={{ width: activeBanner === idx ? '28px' : '10px', height: '8px', transition: 'width 0.4s ease' }}
                />
              ))}
            </div>

          </div>
        </section>

        {/* 2. GLASS CATEGORY STRIP */}
        <section ref={categoryRef} className="container-xxl px-4 py-5 position-relative z-1 reveal-section">
          <div className="glass-card rounded-5 p-4 p-lg-5 shadow-xl bg-white bg-opacity-80 border">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="text-success fw-bold text-uppercase fs-8 tracking-wider">Explore Marketplace</span>
                <h2 className="fw-extrabold text-dark mb-0 fs-2">Shop by Category</h2>
              </div>
              <Link to="/customer/products" className="text-success text-decoration-none fw-bold fs-7 d-flex align-items-center hover-translate">
                <span>View All Categories</span> <i className="bi bi-chevron-right ms-1"></i>
              </Link>
            </div>

            <div className="row row-cols-2 row-cols-sm-4 row-cols-lg-8 g-3">
              {[
                { name: 'Vegetables', icon: 'eco' },
                { name: 'Fruits', icon: 'nutrition' },
                { name: 'Grains', icon: 'bakery_dining' },
                { name: 'Pulses', icon: 'spa' },
                { name: 'Dairy', icon: 'egg' },
                { name: 'Organic', icon: 'psychology' },
                { name: 'Spices', icon: 'soup_kitchen' },
                { name: 'Flowers', icon: 'local_florist' }
              ].map((cat, idx) => (
                <div key={idx} className="col">
                  <Link to="/customer/products" className="text-decoration-none">
                    <div className="glass-card card border-0 p-4 rounded-4 text-center transition-hover h-100 bg-white shadow-xs">
                      <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-xs" style={{ width: '64px', height: '64px' }}>
                        <span className="material-symbols-outlined fs-3">{cat.icon}</span>
                      </div>
                      <span className="fw-bold text-dark fs-7 text-truncate">{cat.name}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS SHOWCASE */}
        <section ref={freshRef} className="container-xxl px-4 py-5 position-relative z-1 reveal-section">
          <div className="text-center mb-5">
            <span className="text-success fw-bold text-uppercase fs-8 tracking-wider">Top Harvests</span>
            <h2 className="fw-extrabold text-dark fs-2 mb-2">Featured Freshness</h2>
            <p className="text-muted">Handpicked listings fresh from certified agricultural partners</p>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {getTop4.map((item) => (
              <div key={item.productId} className="col">
                <div className="glass-card card border-0 shadow-lg rounded-5 h-100 bg-white overflow-hidden transition-hover">
                  
                  <div className="position-relative overflow-hidden bg-light" style={{ height: '230px' }}>
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-100 h-100 object-fit-cover product-img-zoom"
                    />
                    <span className={`position-absolute top-0 start-0 m-3 px-3.5 py-1.5 fs-8 fw-bold rounded-pill shadow-sm ${item.stock === 0 ? "bg-danger text-white" : item.stock < 10 ? "bg-warning text-dark" : "bg-success text-white"}`}>
                      {item.stock === 0 ? "Out of Stock" : item.stock < 10 ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-dark fs-5 mb-0 text-truncate">{item.productName}</h5>
                      <span className="fw-extrabold text-success fs-4">₹{item.price}</span>
                    </div>

                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fs-8 px-3 py-1 rounded-pill align-self-start mb-3">
                      {item.category}
                    </span>

                    <p className="text-muted small text-truncate mb-3" style={{ maxHeight: '2.4em' }}>
                      {item.description}
                    </p>

                    <div className="d-flex justify-content-between p-3 rounded-4 bg-light border border-black border-opacity-10 mb-3 fs-8">
                      <div>
                        <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Available Stock</span>
                        <strong className="text-dark fs-7">{item.stock}</strong>
                      </div>
                      <div>
                        <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Total Stock</span>
                        <strong className="text-dark fs-7">{item.totalStock}</strong>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 text-warning fs-8 fw-bold mb-4">
                      <i className="bi bi-star-fill"></i> {item.avgRating?.toFixed(1) || 0}
                      <span className="text-muted fw-normal ms-1">({item.reviewCount} Reviews)</span>
                    </div>

                    <div className="mt-auto">
                      <Link to="/login" className="w-100 text-decoration-none">
                        <button className="btn btn-success w-100 py-3 rounded-pill fw-bold fs-7 shadow-hover">
                          Buy Now
                        </button>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DIFFERENCE SECTION */}
        <section ref={diffRef} className="container-xxl px-4 py-5 position-relative z-1 reveal-section">
          <div className="glass-card rounded-5 p-4 p-lg-5 shadow-xl bg-white bg-opacity-85 border">
            <div className="text-center mb-5">
              <span className="text-success fw-bold text-uppercase fs-8 tracking-wider">Why Choose Us</span>
              <h2 className="fw-extrabold text-dark fs-2 mb-2">The KisanConnect Difference</h2>
              <p className="text-muted">Direct trade connecting conscious consumers with verified farming families</p>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {[
                { title: 'Fresh Products', desc: 'Harvested after you order. Delivered from field to fork in record time.', icon: 'task_alt' },
                { title: 'Direct From Farmers', desc: 'No middleman. More earnings for farmers, lower costs for you.', icon: 'diversity_3' },
                { title: 'Best Prices', desc: 'Honest pricing reflecting the true value of labor and nature.', icon: 'payments' },
                { title: 'Fast Delivery', desc: 'Efficient logistics network ensuring your produce arrives crisp.', icon: 'local_shipping' },
                { title: 'Secure Payments', desc: 'Bank-grade security for all your transactions and farm investments.', icon: 'verified' },
                { title: 'Trusted Farmers', desc: 'Every producer is verified for quality standards and ethics.', icon: 'verified_user' }
              ].map((diff, idx) => (
                <div key={idx} className="col">
                  <div className="glass-card card border-0 p-4 rounded-4 shadow-xs bg-white h-100 d-flex flex-row align-items-start gap-3 transition-hover">
                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center p-3 flex-shrink-0 shadow-xs" style={{ width: '58px', height: '58px' }}>
                      <span className="material-symbols-outlined fs-4">{diff.icon}</span>
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark fs-6 mb-1">{diff.title}</h5>
                      <p className="text-muted small mb-0 lh-base">{diff.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. WORKFLOW STEPS */}
        <section ref={stepsRef} className="container-xxl px-4 py-5 position-relative z-1 reveal-section">
          <div className="rounded-5 p-5 text-white shadow-2xl position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #12372A 0%, #1B4D3E 100%)' }}>
            <div className="text-center mb-5">
              <span className="badge bg-success bg-opacity-25 text-success-light px-3.5 py-1.5 rounded-pill mb-2 fw-semibold fs-8 border border-success border-opacity-25">Workflow</span>
              <h2 className="fw-extrabold text-white fs-2 mb-1">Simple 4-Step Process</h2>
              <p className="text-light opacity-75 small">How we bring farm-fresh harvests straight to your table</p>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 text-center">
              {[
                { title: 'Browse', desc: 'Search your favorite produce and seasonal specials.', icon: 'search_insights' },
                { title: 'Add to Cart', desc: 'Select quantity and local farmer for each item.', icon: 'add_shopping_cart' },
                { title: 'Place Order', desc: 'Confirm your details and pay securely online.', icon: 'shopping_bag' },
                { title: 'Delivery', desc: 'Fresh harvest delivered to your doorstep.', icon: 'rocket_launch' }
              ].map((step, idx) => (
                <div key={idx} className="col">
                  <div className="p-4 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-15 h-100 d-flex flex-column align-items-center transition-hover">
                    <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '68px', height: '68px' }}>
                      <span className="material-symbols-outlined fs-3">{step.icon}</span>
                    </div>
                    <h5 className="fw-bold text-white fs-6 mb-2">{idx + 1}. {step.title}</h5>
                    <p className="text-light opacity-85 small mb-0 lh-base">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SUPPORT BANNER */}
        <section ref={supportRef} className="container-xxl px-4 py-5 mb-5 position-relative z-1 reveal-section">
          <div className="glass-card card border-0 text-center rounded-5 shadow-2xl p-5 bg-white position-relative overflow-hidden border border-success border-opacity-15">
            <h2 className="fw-extrabold text-dark fs-1 mb-3">Support Local Farmers & Eat Better Today</h2>
            <p className="text-muted lead fs-6 mx-auto mb-4 lh-base" style={{ maxWidth: '650px' }}>
              Join thousands of households across the country who have already switched to farm-direct produce. Healthy families, happy farmers.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="text-decoration-none">
                <button className="btn btn-success px-5 py-3.5 rounded-pill fw-bold shadow-hover fs-6">Start Shopping Now</button>
              </Link>
              <Link to="/register" className="text-decoration-none">
                <button className="btn btn-outline-dark px-5 py-3.5 rounded-pill fw-bold shadow-hover bg-white fs-6">Register As Farmer</button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}