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
  const BASE_URL = "http://localhost:8080";
  const [getTop4, setTop4] = useState([]);

  const heroRef = useRef(null);
  const categoryRef = useRef(null);
  const freshRef = useRef(null);
  const diffRef = useRef(null);
  const stepsRef = useRef(null);
  const supportRef = useRef(null);

  function getProducts4() {
    axios.get("http://localhost:8080/public/products/top4")
      .then((p) => setTop4(p.data))
      .catch((err) => console.error("Error fetching top 4 products:", err));
  }

  useEffect(() => {
    getProducts4();

    const ctx = gsap.context(() => {
      // 1. Hero Section Entrance Animation
      gsap.from(".hero-left > *", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
      });

      gsap.from(".hero-img-wrapper", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out"
      });

      // 2. Category Boxes Animation
      gsap.from(".category-box", {
        scrollTrigger: {
          trigger: categoryRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });

      // 3. Featured Products Card Animation
      gsap.from(".kc-product-card", {
        scrollTrigger: {
          trigger: freshRef.current,
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out"
      });

      // 4. Differences Section Animation (Fixed to reveal cleanly once)
      gsap.from(".differances-box", {
        scrollTrigger: {
          trigger: diffRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out"
      });

      // 5. 4-Step Process Section Animation
      gsap.from(".steps-container > div", {
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      // 6. Support Banner Animation
      gsap.from(supportRef.current, {
        scrollTrigger: {
          trigger: supportRef.current,
          start: "top 95%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0.5,
        scale: 0.96,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
<Navbar menu={["Home", "About", "Login", "Register"]} />
      <div className='home'>
        {/* Hero Section */}
        <div ref={heroRef} className="container-fluid hero d-flex justify-content-center align-items-center gap-4 flex-wrap">
          <div className="d-flex hero-left flex-column justify-content-center align-items-start">
            <div className="hero-1 fw-bold px-3 py-1 mb-2">
              Direct from Farm
            </div>
            <div className="hero-2 fw-bold mb-3">
              Fresh From Farms to Your Home
            </div>
            <div className="hero-3 mb-4">
              Buy directly from local farmers with fresh, healthy, and affordable products. 
              Support rural communities while feeding your family the best nature offers.
            </div>
            <div className="hero-4 d-flex gap-3 flex-wrap w-100">
              <Link to="/customer/home" className="flex-fill text-decoration-none">
                <button className="hero-btn w-100">explore as customer</button>
              </Link>
              <Link to="/dashboard" className="flex-fill text-decoration-none">
                <button className='hero-btn w-100 farmer-btn-alt'>explore as Farmer</button>
              </Link>
            </div>
          </div>
          <div className='hero-img-wrapper'>
            <div className='hero-img'>
              <img className='img-fluid' src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkPnOFRzr4wEzP6VKFX_iVKp0YXOzykQLg_ZRrGDhEyIdSVHb9SthpJZrVDloVeWafA53mAK2AMJWzcuNdAz-xuKH_FFMHPNEwlLkpBkzLsKPOyqGYwHLAyRJ6on6i-c9OghkFKOCaWiW87v0-ArAyQtVn0CSvPTRjqu0M2w-40zdoFWsm3jgAnBkuXGlALbaLwqru9KiohA2g9DiUGVHsKBHagL-XAuAxgeArzQ1VqCETxEZEkYje" alt="Farm Fresh" />
            </div>
            <div className='rounded-4 hero-badge flexing gap-3 shadow-sm'>
              <div>
                <span className='rounded-circle badge p-2 d-flex align-items-center justify-content-center' style={{ backgroundColor: "#3b6934", width: "45px", height: "45px" }}>
                  <span className='bi bi-truck fs-4 text-white'></span>
                </span>
              </div>
              <div>
                <div className='fw-bold text-dark'>Same Day Delivery</div>
                <div className='text-muted small'>In select cities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div ref={categoryRef} className='category ms-4'>
          <div className='category-heading my-4'>
            <div>
              <div className='category-heading-1'>Shop by Category</div>
              <div className='category-heading-2'>Explore our wide range of farm-fresh essentials</div>
            </div>
            <div className='view'>
              <span className='view-all'>View All</span>
              <span className='bi bi-chevron-right ms-1'></span>
            </div>
          </div>
          <div className='category-container mt-4'>
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
              <div key={idx} className='category-box shadow-sm'>
                <div className='category-icon-wrapper flexing mb-2'>
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <div className="category-name">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Freshness Section */}
        <div ref={freshRef} className='fresh'>
          <div className='fresh-header my-4 text-center'>
            <div className='category-heading-1'>Featured Freshness</div>
            <div className='text-muted'>Explore our wide range of farm-fresh essentials</div>
          </div>
          <div className='kc-products-grid mt-4'>
            {getTop4.map((item) => (
              <div className="kc-product-card shadow-sm" key={item.productId}>
                <div className="kc-img-wrapper">
                  <img
                    src={`${BASE_URL}/uploads/products/${item.productImage}`}
                    alt={item.productName}
                  />
                  <span className={`kc-stock-badge ${item.stock === 0 ? "out" : item.stock < 10 ? "low" : "in"}`}>
                    {item.stock === 0 ? "Out Of Stock" : item.stock < 10 ? "Low Stock" : "In Stock"}
                  </span>
                </div>
                <div className="kc-card-body">
                  <div className="kc-title-row">
                    <h3>{item.productName}</h3>
                    <h2>₹ {item.price}</h2>
                  </div>
                  <span className="kc-badge-category">
                    {item.category}
                  </span>
                  <p className="kc-description text-muted">
                    {item.description}
                  </p>
                  <div className="kc-stock-box">
                    <div>
                      <span>Available Stock</span>
                      <h4>{item.stock}</h4>
                    </div>
                    <div>
                      <span>Total Stock</span>
                      <h4>{item.totalStock}</h4>
                    </div>
                  </div>
                  <div className="kc-dates-row">
                    <div>
                      <small>Harvest</small>
                      <strong>{item.harvestDate}</strong>
                    </div>
                    <div>
                      <small>Expiry</small>
                      <strong>{item.expiryDate}</strong>
                    </div>
                  </div>
                  <div className="kc-rating-row">
                    ⭐ {item.avgRating?.toFixed(1) || 0}
                    <span>({item.reviewCount} Reviews)</span>
                  </div>
                  <div className="kc-actions-row">
                    <Link to={`/login`} className="w-100 text-decoration-none">
                      <button className="btn btn-success w-100 py-2 fw-semibold rounded-3">Buy now</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The KisanConnect Difference */}
        <div ref={diffRef} className='differances' id='differances'>
          <div className='category-heading-1 text-center mb-4' id='cate-head'>The KisanConnect Difference</div>
          <div className='differances-container mt-4'>
            {[
              { title: 'Fresh Products', desc: 'Harvested after you order. Delivered from field to fork in record time.', icon: 'task_alt' },
              { title: 'Direct From Farmers', desc: 'No middleman. More earnings for farmers, lower costs for you.', icon: 'diversity_3' },
              { title: 'Best Prices', desc: 'Honest pricing reflecting the true value of labor and nature.', icon: 'payments' },
              { title: 'Fast Delivery', desc: 'Efficient logistics network ensuring your produce arrives crisp.', icon: 'local_shipping' },
              { title: 'Secure Payments', desc: 'Bank-grade security for all your transactions and farm investments.', icon: 'format_image_left' },
              { title: 'Trusted Farmers', desc: 'Every producer is verified for quality standards and ethics.', icon: 'verified_user' }
            ].map((diff, idx) => (
              <div key={idx} className='differances-box shadow-sm'>
                <div className='differances-icon flexing'>
                  <span className="material-symbols-outlined text-3xl">{diff.icon}</span>
                </div>
                <div className='differances-content'>
                  <div className='fs-6 fw-bold mb-1'>{diff.title}</div>
                  <div className='text-muted small'>{diff.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple 4-Step Process */}
        <div ref={stepsRef} className='steps py-5 rounded-4 px-3'>
          <div className='steps-heading text-light text-center fw-bold' id='steps-heading'>Simple 4-Step Process</div>
          <div className='line'></div>
          <div className='text-light steps-container text-center'>
            <div className='flexing flex-column p-2'>
              <div className='badge1 flexing shadow-lg mx-auto'><span className="material-symbols-outlined fs-2">search_insights</span></div>
              <h5>1. Browse</h5>
              <p className='text-center steps-content'>Search your favorite produce and seasonal specials.</p>
            </div>
            <div className='flexing flex-column text-light p-2'>
              <div className='badge1 flexing shadow-lg mx-auto'><span className="material-symbols-outlined fs-2">add_shopping_cart</span></div>
              <h5>2. Add to Cart</h5>
              <p className='text-center steps-content'>Select quantity and local farmer for each item.</p>
            </div>
            <div className='flexing flex-column text-light p-2'>
              <div className='badge1 flexing shadow-lg mx-auto'><span className="material-symbols-outlined fs-2">shopping_bag</span></div>
              <h5>3. Place Order</h5>
              <p className='text-center steps-content'>Confirm your details and pay securely online.</p>
            </div>
            <div className='flexing flex-column text-light p-2'>
              <div className='badge1 flexing shadow-lg mx-auto'><span className="material-symbols-outlined fs-2">rocket_launch</span></div>
              <h5>4. Delivery</h5>
              <p className='text-center steps-content'>Fresh harvest delivered to your doorstep.</p>
            </div>
          </div>
        </div>

        {/* Harvesting Trust Header */}
        <div className='d-flex flex-column gap-1'>
          <div className='text-center mt-4'>
            <div className='category-heading-1'>Harvesting Trust</div>
            <div className='text-muted'>What our happy customers are saying</div>
          </div>
        </div>

        {/* Support Banner */}
        <div ref={supportRef} className='support text-center rounded-4 shadow-lg p-4'>
          <h1 className='text-center text-light support-heading'>Support Local Farmers &amp; Eat Better Today</h1>
          <div className='support-content'>Join thousands of households across the country who have already switched to farm-direct produce. Healthy families, happy farmers.</div>
          <div className='support-btns d-flex gap-3 justify-content-center flex-wrap'>
            <Link to={`/register`} style={{ textDecoration: "none" }}>
              <button className="btn btn-success hero-btn-custom bg-light text-dark px-4 shadow-sm">Start Shopping</button>
            </Link>
            <Link to={`/register`} style={{ textDecoration: "none" }}>
              <button className="px-4 hero-btn-custom btn-fm shadow-sm">Register As Farmer</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}