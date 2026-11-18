import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/common/ProductCard';
import productService from '../../services/productService';
import farmerService from '../../services/farmerService';
import { useCountUp } from '../../hooks/useCountUp';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { resolveProfileImageUrl } from '../../utils/formatters';
import './Home.css';

const HERO_SLIDES = [
  {
    badge: '100% Organic & Chemical-Free',
    title: 'Cultivated with Care, Delivered with Pride.',
    subtitle: 'Direct from Soil to Table',
    desc: 'Take control of your family’s wellness with organic vegetables, seasonal fruits, and whole grains harvested by dedicated Indian farmers and delivered right to your doorstep.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1400',
    ctaPrimary: 'Explore Fresh Harvests',
    ctaLink: '/products',
  },
  {
    badge: 'Sustainable Ecological Stewardship',
    title: 'Earth-Friendly Farming, Pure Wholesome Nutrition.',
    subtitle: 'Zero Synthetic Fertilizers',
    desc: 'Support local agricultural communities committed to regenerative soil practices. Every harvest is naturally grown, sun-ripened, and packed with vitality.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1400',
    ctaPrimary: 'Meet Our Farmers',
    ctaLink: '/products/farmer',
  },
  {
    badge: 'Fair Trade Economics',
    title: 'Zero Middlemen. 100% Direct Farmer Payouts.',
    subtitle: 'Transparent Agro-Commerce',
    desc: 'By eliminating predatory intermediary chains, we ensure rural farmers earn fair, dignified wages while you receive maximum nutritional freshness at honest market prices.',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1400',
    ctaPrimary: 'Join the Movement',
    ctaLink: '/register',
  },
];

export const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const productsRef = useRef(null);

  // Animated metrics counters
  const [familiesCount, familiesRef] = useCountUp(10000, 2);
  const [farmersCount, farmersStatRef] = useCountUp(500, 2);
  const [organicPercent, organicRef] = useCountUp(100, 1.5);
  const [speedHours, speedRef] = useCountUp(24, 1.5);

  // Fetch real backend data
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [prods, allFarmers] = await Promise.allSettled([
          productService.getTop4Products(),
          farmerService.getAllFarmers(),
        ]);

        if (isMounted) {
          if (prods.status === 'fulfilled' && Array.isArray(prods.value)) {
            setFeaturedProducts(prods.value);
          }
          if (allFarmers.status === 'fulfilled' && Array.isArray(allFarmers.value)) {
            setFarmers(allFarmers.value.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Failed to load homepage backend data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    // Carousel Timer
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);

    return () => {
      isMounted = false;
      clearInterval(slideTimer);
    };
  }, []);

  // GSAP Entrance and ScrollTrigger Animations
  useScrollAnimation((gsap) => {
    // Hero Entrance
    gsap.from('.kc-hero-anim-item', {
      y: 35,
      opacity: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
    });

    // Features Stagger
    if (featuresRef.current) {
      gsap.from('.kc-feature-card-anim', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    // Products Stagger
    if (productsRef.current) {
      gsap.from('.kc-product-card-anim', {
        scrollTrigger: {
          trigger: productsRef.current,
          start: 'top 85%',
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      });
    }
  }, []);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div className="kc-home-wrapper min-vh-100 d-flex flex-column">
      <Navbar />

      <main className="flex-grow-1" style={{ paddingTop: '95px' }}>
        {/* Ambient Decorative Glows */}
        <div className="kc-ambient-blob kc-ambient-blob-1"></div>
        <div className="kc-ambient-blob kc-ambient-blob-2"></div>

        {/* ========================================================
            1. HERO SECTION (Figma Aligned Carousel)
            ======================================================== */}
        <section className="kc-container pt-3 pt-md-4 mb-5" ref={heroRef}>
          <div className="kc-hero-banner">
            {/* Background Image with Crossfade */}
            <div
              className="kc-hero-bg"
              style={{ backgroundImage: `url('${currentSlide.image}')` }}
            />
            <div className="kc-hero-overlay" />

            {/* Hero Text Content */}
            <div className="kc-hero-content">
              <span className="kc-hero-badge kc-hero-anim-item">
                <i className="bi bi-patch-check-fill"></i> {currentSlide.badge}
              </span>

              <h1 className="kc-hero-title kc-hero-anim-item">
                {currentSlide.title}
              </h1>

              <p className="kc-hero-desc kc-hero-anim-item">
                {currentSlide.desc}
              </p>

              <div className="d-flex flex-wrap gap-3 align-items-center kc-hero-anim-item">
                <Link to={currentSlide.ctaLink} className="kc-btn kc-btn-fresh kc-btn-lg">
                  <span>{currentSlide.ctaPrimary}</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>

                <Link to="/products" className="kc-btn kc-btn-white kc-btn-lg">
                  <i className="bi bi-grid text-success"></i> Browse All
                </Link>
              </div>

              {/* Slide Navigation Dots */}
              <div className="kc-hero-dots">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`kc-hero-dot ${idx === activeSlide ? 'active' : ''}`}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              2. ANIMATED METRICS STRIP (useCountUp)
              ======================================================== */}
          <div className="kc-metrics-strip mx-3 mx-md-4">
            <div className="row g-4 text-center text-md-start">
              <div className="col-6 col-lg-3">
                <div className="kc-metric-item justify-content-center justify-content-md-start" ref={familiesRef}>
                  <div className="kc-stat-icon kc-stat-icon-fresh d-none d-sm-flex">
                    <i className="bi bi-heart-pulse"></i>
                  </div>
                  <div>
                    <div className="kc-metric-num">{familiesCount.toLocaleString()}+</div>
                    <div className="kc-metric-label">Happy Families Nourished</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="kc-metric-item justify-content-center justify-content-md-start" ref={farmersStatRef}>
                  <div className="kc-stat-icon kc-stat-icon-forest d-none d-sm-flex">
                    <i className="bi bi-people"></i>
                  </div>
                  <div>
                    <div className="kc-metric-num">{farmersCount}+</div>
                    <div className="kc-metric-label">Verified Regional Growers</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="kc-metric-item justify-content-center justify-content-md-start" ref={organicRef}>
                  <div className="kc-stat-icon kc-stat-icon-amber d-none d-sm-flex">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <div className="kc-metric-num">{organicPercent}%</div>
                    <div className="kc-metric-label">Chemical-Free Produce</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="kc-metric-item justify-content-center justify-content-md-start" ref={speedRef}>
                  <div className="kc-stat-icon kc-stat-icon-blue d-none d-sm-flex">
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                  <div>
                    <div className="kc-metric-num">&lt;{speedHours}hr</div>
                    <div className="kc-metric-label">Harvest-to-Door Dispatch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. FEATURED HARVESTS (ProductCard Integration)
            ======================================================== */}
        <section className="kc-section kc-container" ref={productsRef}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
            <div>
              <span className="kc-section-badge">
                <i className="bi bi-stars"></i> Seasonal Highlights
              </span>
              <h2 className="kc-section-title mb-1">Today's Fresh Harvests</h2>
              <p className="kc-section-subtitle">
                Plucked at peak maturity, sorted with care, ready for your kitchen.
              </p>
            </div>

            <Link to="/products" className="kc-btn kc-btn-outline kc-btn-sm align-self-start align-self-md-auto">
              <span>View Full Catalog</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="col-6 col-lg-3">
                  <div className="kc-card p-3 placeholder-glow" style={{ height: '340px' }}>
                    <div className="placeholder w-100 rounded-3 mb-3" style={{ height: '180px' }}></div>
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="row g-4">
              {featuredProducts.map((prod) => (
                <div key={prod.productId || prod.id} className="col-6 col-lg-3 kc-product-card-anim">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="kc-card p-5 text-center">
              <i className="bi bi-basket text-muted display-4 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">Fresh Batches Coming Soon</h5>
              <p className="text-muted small">Our farmers are currently preparing today's morning harvest.</p>
              <Link to="/products" className="kc-btn kc-btn-primary kc-btn-sm d-inline-flex mt-2">
                Browse Marketplace
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================
            4. WHY CHOOSE KISANCONNECT (Value Propositions)
            ======================================================== */}
        <section className="kc-section" style={{ backgroundColor: 'var(--kc-beige)' }} ref={featuresRef}>
          <div className="kc-container">
            <div className="kc-section-header">
              <span className="kc-section-badge">
                <i className="bi bi-shield-lock"></i> The KisanConnect Promise
              </span>
              <h2 className="kc-section-title">Agriculture Rooted in Integrity</h2>
              <p className="kc-section-subtitle">
                We rebuilt the farm supply chain from the ground up to guarantee purity, fairness, and unbeatable flavor.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-6 col-lg-3 kc-feature-card-anim">
                <div className="kc-value-card">
                  <div className="kc-value-icon">
                    <i className="bi bi-tree"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Direct Farm Sourcing</h5>
                  <p className="small text-muted mb-0">
                    Zero speculative middlemen. Produce journeys straight from verified field gates directly to your home.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3 kc-feature-card-anim">
                <div className="kc-value-card">
                  <div className="kc-value-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Pesticide-Free Purity</h5>
                  <p className="small text-muted mb-0">
                    Strict adherence to chemical-free natural methods. No carbide gas, artificial wax coatings, or synthetic sprays.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3 kc-feature-card-anim">
                <div className="kc-value-card">
                  <div className="kc-value-icon">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Fair Farmer Prosperity</h5>
                  <p className="small text-muted mb-0">
                    Farmers set their own pricing, earning up to 40% higher returns than traditional wholesale mandis.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3 kc-feature-card-anim">
                <div className="kc-value-card">
                  <div className="kc-value-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Eco-Ventilated Packs</h5>
                  <p className="small text-muted mb-0">
                    Packed in breathable, biodegradable materials that preserve freshness and reduce plastic footprint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. MEET OUR DEDICATED FARMERS
            ======================================================== */}
        <section className="kc-section kc-container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
            <div>
              <span className="kc-section-badge">
                <i className="bi bi-people"></i> Real Stewards
              </span>
              <h2 className="kc-section-title mb-1">Meet Our Local Farmers</h2>
              <p className="kc-section-subtitle">
                The skilled artisans preserving organic cultivation traditions across India.
              </p>
            </div>

            <Link to="/products/farmer" className="kc-btn kc-btn-outline kc-btn-sm align-self-start align-self-md-auto">
              <span>View All Farmers</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {farmers.length > 0 ? (
              farmers.map((farmer) => {
                const fid = farmer.id || farmer.farmerId;
                const avatar = resolveProfileImageUrl(farmer.profilePic || farmer.image);

                return (
                  <div key={fid} className="col-md-4">
                    <div className="kc-farmer-preview-card">
                      <div className="kc-farmer-cover">
                        <div className="kc-farmer-avatar-box">
                          {avatar ? (
                            <img src={avatar} alt={farmer.name} />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-success fw-bold fs-4">
                              {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="kc-farmer-preview-body">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h5 className="fw-bold text-dark mb-0">{farmer.name || 'Dedicated Farmer'}</h5>
                          <span className="badge kc-badge-organic small">Verified</span>
                        </div>

                        <p className="text-muted small mb-3">
                          <i className="bi bi-geo-alt me-1 text-success"></i>
                          {farmer.village || farmer.district || farmer.location || 'Local Agricultural Region'}
                        </p>

                        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                          <div className="small">
                            <span className="kc-stars me-1"><i className="bi bi-star-fill"></i></span>
                            <span className="fw-bold">{Number(farmer.rating || 4.9).toFixed(1)}</span>
                          </div>

                          <Link
                            to={`/customer/products/farmer/${fid}`}
                            className="kc-btn kc-btn-sm kc-btn-cream text-decoration-none"
                          >
                            <span>Visit Store</span>
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="kc-card p-4 text-center">
                  <p className="text-muted mb-0">Farmers directory connecting...</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            6. CALL TO ACTION BANNER
            ======================================================== */}
        <section className="kc-container pb-5 mb-5">
          <div className="kc-cta-banner">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="badge kc-badge-organic mb-3">Join 10,000+ Conscious Households</span>
                <h2 className="display-6 fw-extrabold text-white mb-3">
                  Ready for Pure, Unadulterated Farm Produce?
                </h2>
                <p className="lead fs-6 text-white-50 mb-0" style={{ maxWidth: '620px' }}>
                  Taste the crisp sweetness of naturally grown food. Delivered in ventilated eco-packs straight from local farms to your home.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="d-flex flex-column flex-sm-row justify-content-lg-end gap-3">
                  <Link to="/products" className="kc-btn kc-btn-fresh kc-btn-lg">
                    Shop Now <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                  <Link to="/register" className="kc-btn kc-btn-white kc-btn-lg">
                    Register Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
