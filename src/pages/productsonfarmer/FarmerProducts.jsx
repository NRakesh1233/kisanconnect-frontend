
import { useState } from "react";
import { useParams } from "react-router-dom";
import './productsFarmer.css'
const farmer = {
  farmerId: 1,
  name: "Ramesh Kumar",
  location: "Hyderabad, Telangana",
  rating: 4.7,
  image: "https://i.pravatar.cc/150?img=12",
};

const products = [
  { id: 1, farmerId: 1, name: "Tomatoes", category: "Vegetables", price: 40, stock: 120, unit: "kg", rating: 4.5, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500" },
  { id: 2, farmerId: 1, name: "Fresh Potatoes", category: "Vegetables", price: 30, stock: 200, unit: "kg", rating: 4.3, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500" },
  { id: 3, farmerId: 1, name: "Organic Rice", category: "Grains", price: 65, stock: 80, unit: "kg", rating: 4.8, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500" },
  { id: 4, farmerId: 1, name: "Fresh Carrots", category: "Vegetables", price: 45, stock: 90, unit: "kg", rating: 4.6, image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500" },
  { id: 5, farmerId: 1, name: "Red Onions", category: "Vegetables", price: 35, stock: 150, unit: "kg", rating: 4.2, image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500" },
  { id: 6, farmerId: 2, name: "Fresh Apples", category: "Fruits", price: 120, stock: 50, unit: "kg", rating: 4.9, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500" },
];

export function ProductsOnFarmer() {
  const { farmerId } = useParams();
  const selectedFarmerId = Number(farmerId || 1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const farmerProducts = products.filter(
    (product) => product.farmerId === selectedFarmerId
  );

  const filteredProducts = farmerProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || product.category === category)
  );

  return (
    <div className="container py-4 farmer-page">
      {/* Farmer Details */}
      <div className="card farmer-profile p-3 mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <img src={farmer.image} alt="Farmer" className="farmer-avatar" />

          <div className="flex-grow-1">
            <h4 className="mb-1">{farmer.name}</h4>
            <p className="text-muted mb-1">
              <i className="bi bi-geo-alt me-2"></i>
              {farmer.location}
            </p>
            <span className="text-success">
              <i className="bi bi-patch-check-fill me-1"></i>
              Verified Farmer
            </span>
          </div>

          <div className="text-md-end">
            <h5 className="text-warning mb-1">
              <i className="bi bi-star-fill me-1"></i>
              {farmer.rating}
            </h5>
            <small className="text-muted">
              {farmerProducts.length} products
            </small>
          </div>
        </div>
      </div>

      {/* Page Heading */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h3 className="mb-1">Farmer Products</h3>
          <p className="text-muted mb-0">
            Explore fresh products directly from this farmer.
          </p>
        </div>
        <span className="badge bg-success fs-6">
          {filteredProducts.length} products found
        </span>
      </div>

      {/* Search and Filter */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        {filteredProducts.map((product) => (
          <div className="col" key={product.id}>
            <div className="card product-card h-100">
              <img
                src={product.image}
                className="card-img-top product-image"
                alt={product.name}
              />

              <div className="card-body d-flex flex-column">
                <span className="badge bg-light text-success align-self-start mb-2">
                  {product.category}
                </span>

                <h5 className="card-title">{product.name}</h5>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="text-success mb-0">
                    ₹{product.price}
                    <small className="text-muted">/{product.unit}</small>
                  </h5>
                  <span className="text-warning">
                    <i className="bi bi-star-fill me-1"></i>
                    {product.rating}
                  </span>
                </div>

                <p className="text-muted small mb-3">
                  <i className="bi bi-box-seam me-2"></i>
                  Stock: {product.stock} {product.unit}
                </p>

                <button
                  className="btn btn-success mt-auto"
                  onClick={() =>
                    alert(`Selected ${product.name} (ID: ${product.id})`)
                  }
                >
                  View Product
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-basket3 display-4 text-muted"></i>
          <h5 className="mt-3">No products found</h5>
          <p className="text-muted">
            Try another search or select a different category.
          </p>
        </div>
      )}
    </div>
  );
}
