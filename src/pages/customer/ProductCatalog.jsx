import React, { useState, useEffect, useMemo } from 'react';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import ProductCard from '../../components/customer/ProductCard';
import ProductFilter from '../../components/customer/ProductFilter';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';

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

  // Load Products & Categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.allSettled([
          productService.getAllProducts(),['vegetables', 'fruits', 'grains', 'organic produce']
         // productService.getCategories()
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
  const filteredProducts = useMemo(() => {
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMaxPrice(1000);
    setSortBy('featured');
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" >
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-4 flex-grow-1" style={{marginTop:"100px"}} >
        {/* Banner Section */}
        <div className="p-4 mb-4 rounded-3 text-white shadow-sm" style={{ backgroundColor: 'var(--kisan-forest-green, #1b4d3e)' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="fw-bold mb-1">Fresh Harvest, Directly from Local Farmers</h2>
              <p className="mb-0 text-light opacity-85">
                Support your community agriculture. Choose from fresh vegetables, fruits, grains, and organic produce.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0 d-none d-md-block">
              <i className="bi bi-flower1 display-3 text-success"></i>
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
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading products...</span>
                </div>
                <p className="mt-3 text-muted">Loading fresh produce for you...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center my-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-4 d-block mb-2"></i>
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5">
                <div className="card-body">
                  <i className="bi bi-search text-muted display-4 d-block mb-3"></i>
                  <h5 className="fw-bold text-dark">No products found</h5>
                  <p className="text-muted">Try adjusting your filter search criteria or price range.</p>
                  <button onClick={handleResetFilters} className="btn btn-kisan-primary btn-sm mt-2">
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted fs-7 fw-medium">
                    Showing <strong className="text-dark">{filteredProducts.length}</strong> products
                  </span>
                </div>

                {/* Product Grid */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="col">
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