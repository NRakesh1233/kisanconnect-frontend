import React from 'react';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import './productCard.css';
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
    <div className="glass-panel card border-0 p-4 mb-4 sticky-top rounded-4 shadow-sm" style={{ top: '90px', zIndex: 10 }}>
      {/* Header & Reset */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
            <i className="bi bi-funnel fs-7"></i>
          </div>
          <span>Filters</span>
        </h5>
        <button
          onClick={onResetFilters}
          className="btn btn-link btn-sm text-decoration-none text-muted p-0 fw-semibold fs-8 hover-success"
        >
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <label className="form-label fw-bold text-secondary text-uppercase fs-8 tracking-wider mb-2">Search Products</label>
        <div className="d-flex align-items-center rounded-pill px-3 py-1 bg-white border shadow-none transition-all focus-ring">
          <span className="text-muted me-2">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control bg-transparent border-0 shadow-none px-0"
            style={{ fontSize: '0.875rem' }}
            placeholder="Search produce, farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="mb-4">
        <label className="form-label fw-bold text-secondary text-uppercase fs-8 tracking-wider mb-2">Sort By</label>
        <select
          className="form-select rounded-pill px-3 py-2 bg-white border shadow-none text-dark fw-medium"
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
        <label className="form-label fw-bold text-secondary text-uppercase fs-8 tracking-wider mb-2">Categories</label>
        <div className="d-flex flex-column gap-2.5 overflow-auto pe-1" style={{ maxHeight: '210px' }}>
          <div className="form-check custom-radio-item">
            <input
              className="form-check-input custom-checkbox"
              type="radio"
              name="categoryRadio"
              id="cat-all"
              checked={selectedCategory === ''}
              onChange={() => setSelectedCategory('')}
            />
            <label className="form-check-label text-dark fw-medium cursor-pointer" style={{ fontSize: '0.875rem' }} htmlFor="cat-all">
              All Categories
            </label>
          </div>
          {categories.map((cat, index) => {
            const catId = cat.id || index;
            return (
              <div key={catId} className="form-check custom-radio-item">
                <input
                  className="form-check-input custom-checkbox"
                  type="radio"
                  name="categoryRadio"
                  id={`cat-${catId}`}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat.toLowerCase())}
                />
                <label className="form-check-label text-dark fw-medium cursor-pointer" style={{ fontSize: '0.875rem' }} htmlFor={`cat-${catId}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-2 pt-2 border-top">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold text-secondary text-uppercase fs-8 tracking-wider mb-0">Max Price</label>
          <span className="fw-extrabold text-success fs-6">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          className="form-range accent-success cursor-pointer"
          min="10"
          max="2000"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <div className="d-flex justify-content-between text-muted fs-8 fw-semibold">
          <span>₹10</span>
          <span>₹2000</span>
        </div>
      </div>
    </div>
  );
}