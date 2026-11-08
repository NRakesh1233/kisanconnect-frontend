import React, { useState, useEffect, useRef } from 'react';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import ProductCard from '../../components/customer/ProductCard';
import ProductFilter from '../../components/customer/ProductFilter';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import gsap from 'gsap';

export default function ProductCatalog() {
  const { totalItemsCount } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');

  const gridRef = useRef(null);

  // Load Products & Categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.allSettled([
          productService.getAllProducts(),
          ['vegetables', 'fruits', 'grains', 'organic produce']
        ]);

        if (productsData.status === 'fulfilled') {
          setProducts(productsData.value || []);
        } else {
          console.warn('Failed to fetch products from backend, using fallback data if needed.');
        }

        if (categoriesData.status === 'fulfilled') {
          setCategories(categoriesData.value || []);
        }
      } catch (err) {
        setError('Failed to connect to backend server. Please make sure Java Spring Boot is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter & Sort logic computed in-memory
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.farmerName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !selectedCategory ||
          product.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesPrice = product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low-high') return a.price - b.price;
        if (sortBy === 'price-high-low') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0; // 'featured' keeps original backend order
      });
  }, [products, searchTerm, selectedCategory, maxPrice, sortBy]);

  // GSAP Stagger animation when filtered products change
  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.product-card-item');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            overwrite: 'auto'
          }
        );
      }
    }
  }, [filteredProducts, loading]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMaxPrice(1000);
    setSortBy('featured');
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f6f9fc 0%, #eef4f1 100%)' }}>
      <CustomerNavbar cartCount={totalItemsCount} />

      {/* Main Container with top and bottom spacing for mobile bottom dock */}
      <main className="container py-4 mb-5 flex-grow-1" style={{ marginTop: '80px' }}>
        
        {/* Glassmorphic Banner Section */}
        <div className="glass-banner p-4 p-lg-5 mb-4 rounded-4 text-white shadow-sm position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #12372A 0%, #1B4D3E 100%)' }}>
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-success bg-opacity-25 text-success-light px-3 py-1 rounded-pill mb-2 fw-semibold fs-8 border border-success border-opacity-25">
                <i className="bi bi-patch-check-fill me-1"></i> Direct From Farms
              </span>
              <h2 className="fw-extrabold mb-2 text-white">Fresh Harvest, Directly from Local Farmers</h2>
              <p className="mb-0 text-light opacity-85 fs-6 lh-base">
                Support your community agriculture. Choose from pesticide-free vegetables, seasonal fruits, grains, and organic produce.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0 d-none d-lg-block">
              <div className="display-3 text-success opacity-75">
                <i className="bi bi-basket3"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="row g-4">
          {/* Left Sidebar Filter */}
          <div className="col-lg-3 col-md-4">
            <ProductFilter
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Product Grid */}
          <div className="col-lg-9 col-md-8">
            {loading ? (
              <div className="text-center py-5 glass-panel rounded-4">
                <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading products...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Loading fresh produce for you...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger border-0 shadow-sm rounded-4 text-center my-4 py-4 bg-danger bg-opacity-15 text-danger fw-semibold" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="glass-panel card border-0 shadow-sm text-center py-5 rounded-4">
                <div className="card-body py-5">
                  <i className="bi bi-search text-success display-4 d-block mb-3 opacity-50"></i>
                  <h5 className="fw-bold text-dark">No products found</h5>
                  <p className="text-muted small mb-3">Try adjusting your filter search criteria or price range.</p>
                  <button onClick={handleResetFilters} className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-hover">
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <span className="text-muted fs-7 fw-semibold">
                    Showing <strong className="text-dark">{filteredProducts.length}</strong> available products
                  </span>
                </div>

                {/* Animated Product Grid */}
                <div ref={gridRef} className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id || product.productId} className="col product-card-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}