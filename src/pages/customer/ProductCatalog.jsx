import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProductCard from '../../components/common/ProductCard';
import ProductFilter from '../../components/common/ProductFilter';
import productService from '../../services/productService';
import gsap from 'gsap';

const ITEMS_PER_PAGE = 8;

export const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const gridRef = useRef(null);

  // Load Products from API
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAllProducts();
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch product catalog:', err);
        if (isMounted) setError('Could not load products. Please check if the server is running.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic categories based on actual available database products
  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return unique.length > 0 ? unique : ['Vegetables', 'Fruits', 'Grains', 'Organic Produce'];
  }, [products]);

  // In-memory Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const prodName = product.productName || product.name || '';
        const prodDesc = product.description || '';
        const farmer = product.farmerName || '';

        const matchesSearch =
          !searchTerm ||
          prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prodDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !selectedCategory ||
          (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

        const matchesPrice = Number(product.price || 0) <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);
        const nameA = a.productName || a.name || '';
        const nameB = b.productName || b.name || '';

        if (sortBy === 'price-low-high') return priceA - priceB;
        if (sortBy === 'price-high-low') return priceB - priceA;
        if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
        return 0; // 'featured' keeps original backend order
      });
  }, [products, searchTerm, selectedCategory, maxPrice, sortBy]);

  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleCategoryChange = (val) => { setSelectedCategory(val); setCurrentPage(1); };
  const handleMaxPriceChange = (val) => { setMaxPrice(val); setCurrentPage(1); };
  const handleSortChange = (val) => { setSortBy(val); setCurrentPage(1); };

  // Pagination slicing
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // GSAP animation when filtered/paginated products change
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || loading || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.kc-catalog-item');
    if (cards.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, [paginatedProducts, loading]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMaxPrice(1000);
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="kc-container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-shop"></i> Farm-to-Table
          </span>
          <h2 className="fw-extrabold text-dark mb-1">Organic Produce Catalog</h2>
          <p className="text-muted small mb-0">
            Showing {filteredProducts.length} certified fresh harvests directly from verified growers.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          type="button"
          className="kc-btn kc-btn-outline kc-btn-sm d-lg-none align-self-start"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <i className="bi bi-funnel"></i>
          <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter Products'}</span>
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Filter Sidebar */}
        <div className={`col-lg-3 ${mobileFilterOpen ? 'd-block' : 'd-none d-lg-block'}`}>
          <ProductFilter
            categories={categories}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            maxPrice={maxPrice}
            setMaxPrice={handleMaxPriceChange}
            sortBy={sortBy}
            setSortBy={handleSortChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Column: Products Grid */}
        <div className="col-lg-9">
          {/* Active Filter Chips */}
          {(searchTerm || selectedCategory) && (
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span className="small text-muted me-1">Active Filters:</span>
              {selectedCategory && (
                <span className="kc-badge kc-badge-organic d-inline-flex align-items-center gap-1">
                  Category: {selectedCategory}
                  <i
                    className="bi bi-x-circle cursor-pointer ms-1"
                    onClick={() => handleCategoryChange('')}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              )}
              {searchTerm && (
                <span className="kc-badge kc-badge-forest d-inline-flex align-items-center gap-1">
                  Query: "{searchTerm}"
                  <i
                    className="bi bi-x-circle cursor-pointer ms-1"
                    onClick={() => handleSearchChange('')}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="btn btn-link btn-sm text-muted p-0 ms-2 text-decoration-none small"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="col-6 col-md-4">
                  <div className="kc-card p-3 placeholder-glow" style={{ height: '340px' }}>
                    <div className="placeholder w-100 rounded-3 mb-3" style={{ height: '180px' }}></div>
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="kc-card p-5 text-center">
              <i className="bi bi-exclamation-triangle text-danger display-5 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">{error}</h5>
              <button onClick={() => window.location.reload()} className="kc-btn kc-btn-outline kc-btn-sm mt-3">
                Reload Catalog
              </button>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="row g-4" ref={gridRef}>
              {paginatedProducts.map((prod) => (
                <div key={prod.productId || prod.id} className="col-6 col-md-4 kc-catalog-item">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="kc-card p-5 text-center">
              <i className="bi bi-search text-muted display-4 d-block mb-3 opacity-50"></i>
              <h5 className="fw-bold text-dark">No Matching Produce Found</h5>
              <p className="text-muted small">
                We couldn't find any produce matching your current filter settings.
              </p>
              <button onClick={handleResetFilters} className="kc-btn kc-btn-primary kc-btn-sm d-inline-flex mt-2">
                Reset All Filters
              </button>
            </div>
          )}

          {/* ========================================================
              PAGINATION
              ======================================================== */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <button
                className="kc-btn kc-btn-cream kc-btn-sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`kc-btn kc-btn-sm ${
                    currentPage === pg ? 'kc-btn-primary' : 'kc-btn-cream'
                  }`}
                  style={{ minWidth: '38px', padding: '0.45rem 0.75rem' }}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}

              <button
                className="kc-btn kc-btn-cream kc-btn-sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
