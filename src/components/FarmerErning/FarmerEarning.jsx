
import React, { useEffect, useRef, useState } from "react";
import "./FarmerEarnings.css";
import { loadFarmerEarnings } from "../../service";
import { FaUserCircle } from "react-icons/fa";
import moment from "moment";

const BASE_URL = "http://localhost:8080";



const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function StarRating({ rating }) {
  return (
    <span
      className="fe-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      <span className="fe-star-icons" aria-hidden="true">
        {"★".repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? "½" : ""}
        {"☆".repeat(5 - Math.ceil(rating))}
      </span>
      <span className="fe-rating-number">{rating ? rating.toFixed(1) : "N/A"}</span>
    </span>
  );
}

function Metric({ icon, label, value, detail, highlight = false }) {
  return (
    <div className={`fe-metric ${highlight ? "fe-metric-highlight" : ""}`}>
      <div className="fe-metric-top">
        <span className="fe-metric-icon">{icon}</span>
        <span className="fe-metric-label">{label}</span>
      </div>
      <div className="fe-metric-value">{value}</div>
      {detail && <div className="fe-metric-detail">{detail}</div>}
    </div>
  );
}

export  function FarmerEarnings({stats}) {

 const products  = stats?.products || [];
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsRef = useRef(null);
const [farmerEarnings, setFarmerEarnings] = useState(null);
  const product = products?.[currentPage] || {};


  async function fetchFarmerEarnings() {
  if (!product?.productId) {
    console.log("Product ID is missing:", product);
    setFarmerEarnings(null);
    return;
  }

  try {
    console.log("Fetching earnings for product ID:", product.productId);

    const earnings = await loadFarmerEarnings(product.productId);
    setFarmerEarnings(earnings);
  } catch (error) {
    console.error("Error fetching earnings:", error);
  }
}







  useEffect(() => {

    fetchFarmerEarnings();

    if (reviewsRef.current) {
      reviewsRef.current.scrollTop = 0;
    }
  }, [currentPage, product?.productId]);

  const goToPage = (page) => {
    if (page >= 0 && page < products.length) {
      setCurrentPage(page);
    }
  };

  if (!products.length) {
    return (
      <div className="fe-empty">
        <div className="fe-empty-icon">🌱</div>
        <h2>No products uploaded yet</h2>
        <p>Upload your first product to see its earnings here.</p>
      </div>
    );
  }
console.log("Current earnings:", farmerEarnings);
  return (
    <main className="fe-dashboard">
      <header className="fe-header">
        <div>
          <div className="fe-eyebrow">FARMER DASHBOARD</div>
          <h1>Product Earnings & Performance</h1>
          <p>
            Track your sales, stock levels, earnings and customer feedback.
          </p>
        </div>

        <div className="fe-product-count">
          <span className="fe-count-icon">📦</span>
          <div>
            <strong>{products.length}</strong>
            <span>Total Products</span>
          </div>
        </div>
      </header>

      <div className="fe-toolbar">
        <div>
          <h2>Product Details</h2>
          <span className="fe-muted">
            Review the performance of each uploaded product.
          </span>
        </div>
        <div className="fe-page-label">
          Product <strong>{currentPage + 1}</strong> of {products.length}
        </div>
      </div>

      <section className="fe-product-card" key={product.productId}>
        {/* LEFT: Product image and information */}
        <aside className="fe-product-info">
          <div className="fe-image-wrap">
{
            product.productImage ? (
            <img
               src={`${BASE_URL}/uploads/products/${product.productImage}`}

              alt={product.productName}
              className="fe-product-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling.style.display = "grid";
              }}
            />):
            <div className="fe-image-fallback" style={{ display: "none" }}>
              🌱
            </div>
}
            {/* <span
              className={`fe-status ${
                product.status === "Active" ? "fe-status-active" : "fe-status-out"
              }`}
            >
              <span className="fe-status-dot" />
              {product.status}
            </span> */}
          </div>

          <div className="fe-product-identity">
            <span className="fe-product-id">ID: #{product.productId}</span>
            <h2>{product.productName}</h2>
            <span className="fe-category">{product.category}</span>
          </div>

          <div className="fe-date-list">
            <div className="fe-date-row">
              <span className="fe-date-icon">📤</span>
              <div>
                <span>harvest Date</span>
                <strong>{moment(product.harvestDate).format("DD MMM YYYY")}</strong>
              </div>
            </div>
            <div className="fe-date-row">
              <span className="fe-date-icon">📅</span>
              <div>
                <span>Expiry Date</span>
                <strong>{moment(product.expiryDate).format("DD MMM YYYY")}</strong>
              </div>
            </div>
          </div>

          <div className="fe-stock-progress">
            <div className="fe-progress-heading">
              <span>Stock sold</span>
              <strong>
                {product.totalStock > 0
                  ? Math.round(
                      ((product.totalStock-product.stock) / product.totalStock) * 100
                    )
                  : 0}
                %
              </strong>
            </div>
           <div className="progress">
                <div className="progress-fill" style={{ width: `${((product.totalStock- product.stock) / product.totalStock * 100)}%` }}></div>
           </div>
          </div>
        </aside>

        {/* MIDDLE: Stock, orders, rating and revenue */}
        <section className="fe-performance">
          <div className="fe-section-heading">
            <div>
              <h3>Performance Overview</h3>
              <p>Sales and inventory summary</p>
            </div>
            <span className="fe-chart-icon">↗</span>
          </div>

          <div className="fe-metrics-grid">
            <Metric
              icon="📦"
              label="Total Stock"
              value={`${product.totalStock} kg`}
              detail="Total quantity added"
            />
            <Metric
              icon="🌿"
              label="Remaining Stock"
              value={`${product.stock} kg`}
              detail="Available inventory"
            />
            <Metric
              icon="🛒"
              label="Quantity Sold"
              value={`${product.totalStock - product.stock} kg`}
              detail="Units sold"
            />
            <Metric
              icon="💰"
              label="Price per Unit"
              value={`${formatCurrency(product.price)}/kg`}
              detail="Current selling price"
            />
            <Metric
              icon="📋"
              label="Total Orders"
              value={farmerEarnings?.ordersCount  || 0}
              detail="Orders containing product"
            />
            <Metric
              icon="⭐"
              label="Average Rating"
              value={<StarRating rating={farmerEarnings?.rating} />}
              detail={`${farmerEarnings?.reviews.length} sample reviews`}
            />
          </div>

          <div className="fe-revenue-card">
            <div className="fe-revenue-icon">₹</div>
            <div className="fe-revenue-copy">
              <span>Total Revenue</span>
              <strong>{formatCurrency(product.price * (product.totalStock - product.stock))}</strong>
              <small>Sample sales revenue for this product</small>
            </div>
            <div className="fe-revenue-trend">↗</div>
          </div>

          <div className="fe-summary-note">
            <span className="bi bi-info-circle"></span>
            <p>
              Revenue and order counts are illustrative demo values. Connect
              your order and payment APIs before using them for real earnings.
            </p>
          </div>
        </section>

        {/* RIGHT: Independently scrollable reviews */}
        <aside className="fe-reviews">
          <div className="fe-reviews-header">
            <div>
              <h3>Customer Reviews</h3>
              <p>Feedback for {product.productName}</p>
            </div>
            <span className="fe-review-count">{farmerEarnings?.reviews.length}</span>
          </div>

          <div className="fe-overall-rating">
            <strong>{farmerEarnings?.rating?.toFixed(1) || 'N/A'}</strong>
            <div>
              <StarRating rating={farmerEarnings?.rating} />
              <span>Average product rating</span>
            </div>
          </div>

          <div className="fe-review-list" ref={reviewsRef}>
            {farmerEarnings?.reviews.length > 0 ? (
            farmerEarnings?.reviews.map((review) => (
                <article className="fe-review" key={review.id}>
                  <div className="fe-review-person">
                    {
review.customerDetails.profilePic ? (<img
  src={`${BASE_URL}/uploads/profiles/${review.customerDetails.profilePic}`}
  alt="Profile"
  className="rounded-circle object-fit-cover border border-success"
  width="42"
  height="42"
/>):  <FaUserCircle className="review-avatar"/>
                    }
                
                    <div className="fe-review-user">
                      <strong>{review.customerDetails.name}</strong>
                      <span>{moment(review.date).format("DD MMM YYYY,hh:mm A")}</span>
                    </div>
                  </div>

                  <StarRating rating={review.rating} />

                  <p className="fe-review-text">{review.comment}</p>

                  <div className="fe-verified">✓ Sample customer review</div>
                </article>
              ))
            ) : (
              <div className="fe-no-reviews">
                <span>💬</span>
                <h4>No reviews yet</h4>
                <p>Your first customer review will appear here.</p>
              </div>
            )}
          </div>

          <div className="fe-reviews-footer">
            <span>Showing reviews for</span>
            <strong>#{product.productId}</strong>
          </div>
        </aside>
      </section>

      {/* PAGINATION */}
      <nav className="fe-pagination" aria-label="Product pagination">
        <button
          className="fe-page-button fe-prev"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ← <span>Previous</span>
        </button>

        <div className="fe-page-numbers">
          {products.map((item, index) => (
            <button
              key={item.id}
              className={`fe-page-number ${
                currentPage === index ? "fe-page-active" : ""
              }`}
              onClick={() => goToPage(index)}
              aria-label={`Go to ${item.name}`}
              aria-current={currentPage === index ? "page" : undefined}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          className="fe-page-button fe-next"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === products.length - 1}
        >
          <span>Next</span> →
        </button>
      </nav>

      <p className="fe-pagination-hint">
        Showing product {currentPage + 1} of {products.length}
      </p>
    </main>
  );
}
