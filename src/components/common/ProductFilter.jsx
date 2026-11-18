import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const ProductFilter = ({
  categories = [],
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onResetFilters,
}) => {
  return (
    <div className="kc-card p-4 mb-4 sticky-top" style={{ top: '90px', zIndex: 10 }}>
      {/* Header & Reset */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-success"
            style={{ width: '32px', height: '32px', backgroundColor: 'var(--kc-fresh-green-light)' }}
          >
            <i className="bi bi-funnel"></i>
          </div>
          <span>Refine Harvest</span>
        </h6>
        <button
          onClick={onResetFilters}
          className="btn btn-link btn-sm text-decoration-none text-muted p-0 fw-semibold"
          style={{ fontSize: '0.82rem' }}
        >
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <label className="kc-label small text-uppercase" style={{ letterSpacing: '0.05em' }}>
          Search Products
        </label>
        <div className="position-relative">
          <i
            className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
            style={{ pointerEvents: 'none' }}
          ></i>
          <input
            type="text"
            className="kc-input ps-5"
            placeholder="Search produce, farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="mb-4">
        <label className="kc-label small text-uppercase" style={{ letterSpacing: '0.05em' }}>
          Sort Results
        </label>
        <select
          className="kc-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured / Newest</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="name-asc">Alphabetical: A to Z</option>
        </select>
      </div>

      {/* Price Range Slider */}
      {setMaxPrice && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="kc-label small text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>
              Max Price
            </label>
            <span className="fw-bold text-success small">{formatCurrency(maxPrice || 1000)}</span>
          </div>
          <input
            type="range"
            className="form-range"
            min="10"
            max="1500"
            step="10"
            value={maxPrice || 1000}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
            <span>₹10</span>
            <span>₹1,500</span>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-2">
        <label className="kc-label small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
          Categories
        </label>
        <div className="d-flex flex-column gap-2 overflow-auto pe-1" style={{ maxHeight: '240px' }}>
          {/* All Categories Option */}
          <div
            className={`p-2 rounded-3 d-flex align-items-center gap-2 cursor-pointer transition-all ${
              selectedCategory === '' ? 'bg-success text-white fw-bold' : 'bg-light text-dark'
            }`}
            onClick={() => setSelectedCategory('')}
            style={{ cursor: 'pointer' }}
          >
            <i className={`bi ${selectedCategory === '' ? 'bi-check-circle-fill text-white' : 'bi-circle text-muted'}`}></i>
            <span className="small">All Produce</span>
          </div>

          {categories.map((cat, index) => {
            const catName = typeof cat === 'string' ? cat : cat?.name || `Category ${index}`;
            const isSelected = selectedCategory?.toLowerCase() === catName.toLowerCase();

            return (
              <div
                key={catName}
                className={`p-2 rounded-3 d-flex align-items-center gap-2 cursor-pointer transition-all ${
                  isSelected ? 'bg-success text-white fw-bold' : 'bg-light text-dark'
                }`}
                onClick={() => setSelectedCategory(catName.toLowerCase())}
                style={{ cursor: 'pointer' }}
              >
                <i className={`bi ${isSelected ? 'bi-check-circle-fill text-white' : 'bi-circle text-muted'}`}></i>
                <span className="small text-capitalize">{catName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
