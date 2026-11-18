import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import farmerService from '../../services/farmerService';
import { formatCurrency, formatDate, resolveProductImageUrl } from '../../utils/formatters';
import gsap from 'gsap';

export const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & View States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [view, setView] = useState('grid'); // 'grid' | 'table'

  const containerRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData] = await farmerService.loadDashboard();
      if (dashData && Array.isArray(dashData.products)) {
        setProducts(dashData.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load farmer inventory:', err);
      setError('Could not load inventory items. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialProducts = async () => {
      try {
        const [dashData] = await farmerService.loadDashboard();
        if (isMounted) {
          if (dashData && Array.isArray(dashData.products)) {
            setProducts(dashData.products);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer inventory:', err);
        if (isMounted) {
          setError('Could not load inventory items. Please refresh or try again later.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Inventory Stock Metrics
  const stockMetrics = useMemo(() => {
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      if (stock === 0) outOfStock++;
      else if (stock < 10) lowStock++;
      else inStock++;
    });

    return {
      total: products.length,
      outOfStock,
      lowStock,
      inStock,
    };
  }, [products]);

  // Derived Categories
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    products.forEach((p) => {
      if (p.category) {
        cats.add(p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase());
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((p) => (p.productName || '').toLowerCase().includes(query));
    }

    // Category filter
    if (category !== 'All') {
      result = result.filter(
        (p) => (p.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    // Sort
    switch (sort) {
      case 'Price Low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'Price High':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'Stock':
        result.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
        break;
      case 'Newest':
      default:
        // maintain order
        break;
    }

    return result;
  }, [products, search, category, sort]);

  // GSAP Animations
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || loading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.kc-inv-stat-card', {
        opacity: 0,
        y: 15,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
      });
      gsap.from('.kc-inv-item', {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.15,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, view, filteredProducts]);

  const handleDeleteNotice = (productName) => {
    alert(
      `Product deletion for "${productName}" is restricted by the current catalog policy. You can update stock to 0 kg or edit the listing details.`
    );
  };

  return (
    <div ref={containerRef} className="container-fluid p-0">
      {/* ========================================================
          1. HEADER & ACTIONS
          ======================================================== */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-box-seam"></i> Produce Catalog
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Harvest Inventory Management</h2>
          <p className="text-muted small mb-0">
            Monitor produce batches, update stock levels, and review prices.
          </p>
        </div>

        <Link
          to="/dashboard/products/add"
          className="kc-btn kc-btn-primary kc-btn-sm d-flex align-items-center gap-2 align-self-start align-self-sm-auto"
        >
          <i className="bi bi-plus-circle"></i>
          <span>Add New Harvest</span>
        </Link>
      </div>

      {/* ========================================================
          2. INVENTORY SUMMARY STATS
          ======================================================== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3 kc-inv-stat-card">
          <div className="kc-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted small">Total Harvests</span>
              <i className="bi bi-boxes text-success fs-5"></i>
            </div>
            <h3 className="fw-extrabold text-dark mb-0">{stockMetrics.total}</h3>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Listed Products</span>
          </div>
        </div>

        <div className="col-6 col-lg-3 kc-inv-stat-card">
          <div className="kc-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted small">Available In Stock</span>
              <i className="bi bi-check-circle text-success fs-5"></i>
            </div>
            <h3 className="fw-extrabold text-success mb-0">{stockMetrics.inStock}</h3>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Adequate Inventory</span>
          </div>
        </div>

        <div className="col-6 col-lg-3 kc-inv-stat-card">
          <div className="kc-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted small">Low Stock Alert</span>
              <i className="bi bi-exclamation-triangle text-warning fs-5"></i>
            </div>
            <h3 className="fw-extrabold text-warning mb-0">{stockMetrics.lowStock}</h3>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Less than 10 kg</span>
          </div>
        </div>

        <div className="col-6 col-lg-3 kc-inv-stat-card">
          <div className="kc-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted small">Sold Out</span>
              <i className="bi bi-x-circle text-danger fs-5"></i>
            </div>
            <h3 className="fw-extrabold text-danger mb-0">{stockMetrics.outOfStock}</h3>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Requires Restock</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH, FILTER & VIEW CONTROLS TOOLBAR
          ======================================================== */}
      <div
        className="kc-card p-3 mb-4 shadow-sm"
        style={{ backgroundColor: 'var(--kc-white)' }}
      >
        <div className="row g-2 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: '0.9rem' }}
              ></i>
              <input
                type="text"
                className="form-control rounded-pill ps-5 pe-3 py-2 border-0"
                placeholder="Search harvests by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  backgroundColor: 'var(--kc-cream)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-pill py-2 border-0"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ backgroundColor: 'var(--kc-cream)', fontSize: '0.88rem' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-6 col-md-2">
            <select
              className="form-select rounded-pill py-2 border-0"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ backgroundColor: 'var(--kc-cream)', fontSize: '0.88rem' }}
            >
              <option value="Newest">Newest First</option>
              <option value="Price Low">Price: Low to High</option>
              <option value="Price High">Price: High to Low</option>
              <option value="Stock">Highest Stock</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="col-12 col-md-2 text-end d-flex justify-content-end gap-1">
            <button
              type="button"
              className={`kc-icon-btn ${view === 'grid' ? 'bg-success text-white' : ''}`}
              onClick={() => setView('grid')}
              title="Grid View"
            >
              <i className="bi bi-grid-fill"></i>
            </button>
            <button
              type="button"
              className={`kc-icon-btn ${view === 'table' ? 'bg-success text-white' : ''}`}
              onClick={() => setView('table')}
              title="Table View"
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. PRODUCT LISTING (GRID OR TABLE)
          ======================================================== */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 text-muted small fw-semibold">Loading your inventory...</p>
        </div>
      ) : error ? (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-exclamation-triangle text-danger display-5 d-block mb-3"></i>
          <h5 className="fw-bold text-dark">{error}</h5>
          <button onClick={fetchProducts} className="kc-btn kc-btn-outline kc-btn-sm mt-3">
            Reload Inventory
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-basket text-muted display-4 d-block mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark">No Products Found</h4>
          <p className="text-muted small mb-4">
            {search || category !== 'All'
              ? 'Try adjusting your search criteria or category filter.'
              : 'You have not uploaded any harvests yet.'}
          </p>
          <Link to="/dashboard/products/add" className="kc-btn kc-btn-primary kc-btn-sm">
            Upload Your First Produce
          </Link>
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div className="row g-4">
          {filteredProducts.map((item) => {
            const pid = item.productId || item.id;
            const stock = Number(item.stock) || 0;
            const totalStock = Number(item.totalStock) || stock;
            const img = resolveProductImageUrl(item.productImage || item.image);

            return (
              <div key={pid} className="col-12 col-sm-6 col-lg-4 kc-inv-item">
                <div className="kc-card h-100 d-flex flex-column overflow-hidden position-relative shadow-sm">
                  {/* Image Container */}
                  <div className="position-relative overflow-hidden" style={{ height: '200px', backgroundColor: 'var(--kc-beige)' }}>
                    <img
                      src={img}
                      alt={item.productName}
                      className="w-100 h-100 object-fit-cover"
                      loading="lazy"
                    />
                    {/* Stock Status Badge */}
                    <span
                      className={`badge position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm ${
                        stock === 0 ? 'bg-danger' : stock < 10 ? 'bg-warning text-dark' : 'bg-success'
                      }`}
                    >
                      {stock === 0 ? 'Sold Out' : stock < 10 ? 'Low Stock' : 'In Stock'}
                    </span>

                    {/* Organic Badge */}
                    {item.organic && (
                      <span className="badge kc-badge-organic position-absolute top-0 start-0 m-3 shadow-sm">
                        <i className="bi bi-patch-check-fill me-1"></i> Organic
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-light text-success fw-bold small text-uppercase">
                          {item.category || 'Produce'}
                        </span>
                        <h4 className="fw-extrabold text-success mb-0 fs-5">
                          {formatCurrency(item.price || 0)}
                          <span className="fs-7 text-muted fw-normal">/{item.unit || 'kg'}</span>
                        </h4>
                      </div>

                      <h3 className="fw-bold text-dark fs-5 mb-2">{item.productName}</h3>
                      <p className="text-muted small mb-3 line-clamp-2" style={{ fontSize: '0.82rem' }}>
                        {item.description || 'Fresh morning harvest.'}
                      </p>

                      {/* Stock Progress Box */}
                      <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Available Stock</span>
                          <strong className="text-dark small">{stock} {item.unit || 'kg'}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Total Added</span>
                          <span className="text-muted small">{totalStock} {item.unit || 'kg'}</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className={`progress-bar ${stock === 0 ? 'bg-danger' : stock < 10 ? 'bg-warning' : 'bg-success'}`}
                            role="progressbar"
                            style={{
                              width: `${totalStock > 0 ? Math.min(100, Math.round((stock / totalStock) * 100)) : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Dates */}
                      {(item.harvestDate || item.expiryDate) && (
                        <div className="d-flex justify-content-between text-muted small mb-3" style={{ fontSize: '0.75rem' }}>
                          {item.harvestDate && (
                            <div>
                              <span className="d-block text-muted">Harvest Date</span>
                              <strong className="text-dark">{formatDate(item.harvestDate)}</strong>
                            </div>
                          )}
                          {item.expiryDate && (
                            <div className="text-end">
                              <span className="d-block text-muted">Best Before</span>
                              <strong className="text-dark">{formatDate(item.expiryDate)}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      <Link
                        to={`/dashboard/products/update/${pid}`}
                        className="kc-btn kc-btn-outline kc-btn-sm flex-grow-1 text-center"
                      >
                        <i className="bi bi-pencil-square me-1"></i> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(item.productName)}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                        title="Delete product"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="kc-card overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: 'var(--kc-cream)', fontSize: '0.82rem' }}>
                <tr>
                  <th className="py-3 px-4">Harvest Produce</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Unit Price</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Harvest Date</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {filteredProducts.map((item) => {
                  const pid = item.productId || item.id;
                  const stock = Number(item.stock) || 0;
                  const totalStock = Number(item.totalStock) || stock;
                  const img = resolveProductImageUrl(item.productImage || item.image);

                  return (
                    <tr key={pid}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={img}
                            alt={item.productName}
                            className="rounded-3 object-fit-cover shadow-sm"
                            style={{ width: '48px', height: '48px' }}
                          />
                          <div>
                            <strong className="text-dark d-block">{item.productName}</strong>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              ID: #{pid}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge bg-light text-success">{item.category}</span>
                      </td>
                      <td className="py-3 px-3 fw-bold text-success">
                        {formatCurrency(item.price || 0)}/{item.unit || 'kg'}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-dark">{stock}</strong>{' '}
                        <span className="text-muted">/ {totalStock} {item.unit || 'kg'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`badge rounded-pill ${
                            stock === 0 ? 'bg-danger' : stock < 10 ? 'bg-warning text-dark' : 'bg-success'
                          }`}
                        >
                          {stock === 0 ? 'Sold Out' : stock < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {item.harvestDate ? formatDate(item.harvestDate) : '—'}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <Link
                            to={`/dashboard/products/update/${pid}`}
                            className="kc-btn kc-btn-outline kc-btn-sm"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(item.productName)}
                            className="btn btn-outline-danger btn-sm rounded-pill"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
