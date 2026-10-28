import React from 'react';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductFilter({
  categories = [],
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onResetFilters
}) {
  return (
    <div className="card shadow-sm border-0 p-3 mb-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-funnel text-success me-2"></i>Filters
        </h5>
        <button
          onClick={onResetFilters}
          className="btn btn-link btn-sm text-decoration-none text-muted p-0"
        >
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>Search Products</label>
        <div className="d-flex align-items-center border rounded overflow-hidden bg-light">
          <span className=" bg-light border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            style={{ fontSize: '0.875rem' }}
            placeholder="Search by name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="mb-4">
        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>Sort By</label>
        <select
          className="form-select"
          style={{ fontSize: '0.875rem' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured / Default</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* Category Selection */}
      <div className="mb-4">
        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>Categories</label>
        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '200px' }}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="categoryRadio"
              id="cat-all"
              checked={selectedCategory === ''}
              onChange={() => setSelectedCategory('')}
            />
            <label className="form-check-label text-dark" style={{ fontSize: '0.875rem' }} htmlFor="cat-all">
              All Categories
            </label>
          </div>
          {categories.map((cat, index) => {
            const catId = cat.id || index;
            // const catValue = cat.name;
            return (
              <div key={catId} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="categoryRadio"
                  id={`cat-${catId}`}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat.toLowerCase())}
                />
                <label className="form-check-label text-dark" style={{ fontSize: '0.875rem' }} htmlFor={`cat-${catId}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label fw-medium text-secondary mb-0" style={{ fontSize: '0.875rem' }}>Max Price</label>
          <span className="fw-bold text-success" style={{ fontSize: '0.875rem' }}>₹{maxPrice}</span>
        </div>
        <input
          type="range"
          className="form-range"
          min="10"
          max="1000"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
          <span>₹10</span>
          <span>₹1000</span>
        </div>
      </div>
    </div>
  );
}