import "./products.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaFilter,
    FaLeaf,
    FaAppleAlt,
    FaSeedling,
    FaCarrot,
    FaPepperHot,
    FaShoppingBasket
} from "react-icons/fa";
export default function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    let navigate = useNavigate();





useEffect(() => {

if(localStorage.getItem("role")!=="FARMER"){
     navigate("/login");
}
}, [onload]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/public/products")
            .then((response) => {
                setProducts(response.data);
                setFilteredProducts(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);
    useEffect(() => {
        let temp = [...products];
        if (category !== "All") {
            temp = temp.filter((p) =>
                p.category.toLowerCase() === category.toLowerCase()
            );
        }
        if (search !== "") {
            temp = temp.filter((p) =>
                p.productName
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }
        setFilteredProducts(temp);
    }, [category, search, products]);
    return (
        <div className="products-page">
            <h1 style={{ color: "red" }}>TEST</h1>
            <div className="herop bg-success" style={{backgroundColor:"black"}}>
                <div className="herop-overlay">
                    <h1>
                        Good Morning 👋
                    </h1>
                    <h2>
                        Fresh vegetables directly from trusted farmers.
                    </h2>
                    <p>
                        Buy Fresh • Eat Healthy • Support Farmers
                    </p>
                    <div className="herop-search">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search vegetables, fruits..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button>
                            <FaFilter/>
                            Filters
                        </button>
                    </div>
                </div>
            </div>
            {/* CATEGORY */}
            <div className="category-section">
               <button
                 className="active filter-btn"
                      onClick={() => setShowFilter(!showFilter)}>
                             <FaFilter />
                           Filters
                           </button>
                <button
                    className={category === "All" ? "active" : ""}
                    onClick={() => setCategory("All")}
                >
                    <FaShoppingBasket />
                    All
                </button>
                <button
                    className={category === "Vegetables" ? "active" : ""}
                    onClick={() => setCategory("Vegetables")}
                >
                    <FaCarrot />
                    Vegetables
                </button>
                <button
                    className={category === "Fruits" ? "active" : ""}
                    onClick={() => setCategory("Fruits")}
                >
                    <FaAppleAlt />
                    Fruits
                </button>
                <button
                    className={category === "Grains" ? "active" : ""}
                    onClick={() => setCategory("Grains")}
                >
                    <FaSeedling />
                    Grains
                </button>
                <button
                    className={category === "Organic" ? "active" : ""}
                    onClick={() => setCategory("Organic")}
                >
                    <FaLeaf />
                    Organic
                </button>
                <button
                    className={category === "Spices" ? "active" : ""}
                    onClick={() => setCategory("Spices")}
                >
                    <FaPepperHot />
                    Spices
                </button>
            </div>
            <div className="content">
                {/* FILTER */}
                <div className={`filter ${showFilter ? "show" : ""}`}>
                    <h2>
                        Filters
                    </h2>
                    <label>
                        Price
                    </label>
                    <input type="range" />
                    <label>
                        Organic Only
                    </label>
                    <input type="checkbox" />
                    <label>
                        In Stock
                    </label>
                    <input type="checkbox" />
                    <label>
                        Sort
                    </label>
                    <select>
                        <option>
                            Newest
                        </option>
                        <option>
                            Price Low
                        </option>
                        <option>
                            Price High
                        </option>
                        <option>
                            Top Rated
                        </option>
                    </select>
                </div>
                {/* PRODUCT AREA */}
                <div className="products-container">
                    <div className="offer-banner bg-success">
                        <div>
                            <h1>
                                🌿 Fresh Organic Products
                            </h1>
                            <p>
                                Up to 30% OFF this week
                            </p>
                            <button>
                                Shop Now
                            </button>
                        </div>
                    </div>
                    <h2>
                        Fresh Arrivals
                    </h2>
                    <p>
                        {filteredProducts.length} Products Found
                    </p>
                    {/*
filteredProducts.map()
*/}
                    {
                        loading ?
                            <div className="loading">
                                Loading Products...
                            </div>
                            :
                            <div className="products-grid">
                                {
                                    filteredProducts.map((product) => (
                                        <div className="product-card" key={product.productId}>
                                            <div className="image-box">
                                                <img
                                                    src={`http://localhost:8080/uploads/products/${product.image}`}
                                                    alt=""
                                                />
                                                <div className="discount-badge">
                                                    10% OFF
                                                </div>
                                                <div className="wishlist">
                                                    ♡
                                                </div>
                                                <div className="organic-badge">
                                                    Organic
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="farmer-details">
                                                    <img
                                                        className="farmer-pic"
                                                        src={`http://localhost:8080/uploads/profile/${product.profilePic}`}
                                                        alt=""
                                                    />
                                                    <div>
                                                        <h4>
                                                            {product.farmerName}
                                                        </h4>
                                                        <p>
                                                            Verified Farmer ✔
                                                        </p>
                                                    </div>
                                                </div>
                                                <h2 className="product-name">
                                                    {product.productName}
                                                </h2>
                                                <p className="category">
                                                    {product.category}
                                                </p>
                                                <div className="rating-row">
                                                    ⭐⭐⭐⭐⭐
                                                    <span>
                                                        4.8
                                                    </span>
                                                </div>
                                                <div className="price-row">
                                                    <h2>
                                                        ₹{product.price}
                                                        <span>
                                                            / {product.unit}
                                                        </span>
                                                    </h2>
                                                </div>
                                                <div className="stock">
                                                    Stock :
                                                    {product.stock}
                                                </div>
                                                <div className="date-row">
                                                    <div>
                                                        Harvest
                                                        <br />
                                                        <b>
                                                            {product.harvestDate}
                                                        </b>
                                                    </div>
                                                    <div>
                                                        Expiry
                                                        <br />
                                                        <b>
                                                            {product.expiryDate}
                                                        </b>
                                                    </div>
                                                </div>
                                                <div className="button-row">
                                                    <button className="cart-btn">
                                                        🛒 Add Cart
                                                    </button>
                                                    <button className="buy-btn">
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                    }
                    {/* ===========================
TRENDING PRODUCTS
=========================== */}
                    <div className="section-header">
                        <h2>🔥 Trending This Week</h2>
                        <p>Top selling products from trusted farmers</p>
                    </div>
                    <div className="trending-container">
                        {
                            filteredProducts.slice(0, 4).map((product) => (
                                <div className="trending-card" key={product.productId}>
                                    <img
                                        src={`http://localhost:8080/uploads/products/${product.image}`}
                                        alt=""
                                    />
                                    <div>
                                        <h3>{product.productName}</h3>
                                        <p>{product.category}</p>
                                        <h4>₹{product.price}/{product.unit}</h4>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {/* ===========================
RECOMMENDED PRODUCTS
=========================== */}
                    <div className="section-header">
                        <h2>⭐ Recommended For You</h2>
                        <p>Freshly harvested products selected for you</p>
                    </div>
                    <div className="recommended-grid">
                        {
                            filteredProducts.slice(0, 3).map((product) => (
                                <div className="recommended-card" key={product.productId}>
                                    <img
                                        src={`http://localhost:8080/uploads/products/${product.image}`}
                                        alt=""
                                    />
                                    <div>
                                        <h3>{product.productName}</h3>
                                        <p>
                                            Fresh from
                                            <b>
                                                {product.farmerName}
                                            </b>
                                        </p>
                                        <h2>
                                            ₹{product.price}
                                        </h2>
                                        <button>
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {/* ===========================
TOP FARMERS
=========================== */}
                    <div className="section-header">
                        <h2>👨‍🌾 Top Farmers</h2>
                        <p>Verified sellers with excellent ratings</p>
                    </div>
                    <div className="farmer-grid">
                        {
                            filteredProducts
                                .filter(
                                    (product, index, self) =>
                                        index === self.findIndex(
                                            (p) => p.farmerId === product.farmerId
                                        )
                                )
                                .map((farmer) => (
                                    <div className="farmer-card" key={farmer.farmerId}>
                                        <img
                                            src={`http://localhost:8080/uploads/profile/${farmer.profilePic}`}
                                            alt=""
                                        />
                                        <h3>
                                            {farmer.farmerName}
                                        </h3>
                                        <p>
                                            ⭐ 4.9 Rating
                                        </p>
                                        <p>
                                            Verified Farmer
                                        </p>
                                        <button>
                                            View Products
                                        </button>
                                    </div>
                                ))
                        }
                    </div>
                    {/* ===========================
CUSTOMER REVIEWS
=========================== */}
                    <div className="section-header">
                        <h2>💚 What Customers Say</h2>
                        <p>Trusted by thousands of happy customers</p>
                    </div>
                    <div className="review-grid">
                        <div className="review-card">
                            ★★★★★
                            <p>
                                "The vegetables were extremely fresh and packed nicely."
                            </p>
                            <h4>
                                Rahul Sharma
                            </h4>
                        </div>
                        <div className="review-card">
                            ★★★★★
                            <p>
                                "Fast delivery and genuine farmers."
                            </p>
                            <h4>
                                Priya Reddy
                            </h4>
                        </div>
                        <div className="review-card">
                            ★★★★★
                            <p>
                                "Best agriculture marketplace I've used."
                            </p>
                            <h4>
                                Arjun Kumar
                            </h4>
                        </div>
                    </div>
                    {/* ===========================
NEWSLETTER
=========================== */}
                    <div className="newsletter">
                        <div>
                            <h1>
                                Stay Updated 🌱
                            </h1>
                            <p>
                                Get fresh deals, seasonal offers and new arrivals directly in your inbox.
                            </p>
                        </div>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Enter your email"
                            />
                            <button>
                                Subscribe
                            </button>
                        </div>
                    </div>
                    {/* ===========================
EMPTY STATE
=========================== */}
                    {
                        !loading && filteredProducts.length === 0 &&
                        <div className="empty-products">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/7486/7486800.png"
                                alt=""
                            />
                            <h2>
                                No Products Found
                            </h2>
                            <p>
                                Try changing your search or category.
                            </p>
                        </div>
                    }
                    {/* ===========================
LOADING
=========================== */}
                    {
                        loading &&
                        <div className="loading-container">
                            <div className="loader"></div>
                            <h3>
                                Loading Products...
                            </h3>
                        </div>
                    }
                    {/* ===========================
FLOATING CART
=========================== */}
                    <div className="floating-cart">
                        🛒
                        <span>
                            3
                        </span>
                    </div>
                    {/* ===========================
SCROLL TO TOP
=========================== */}
                    <button
                        className="scroll-top"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            })
                        }
                    >
                        ↑
                    </button>
                    {/* ===========================
FOOTER
=========================== */}
                    <footer>
                        <div className="footer-grid">
                            <div>
                                <h2>
                                    KisanConnect
                                </h2>
                                <p>
                                    Connecting Farmers directly with Customers.
                                    Fresh • Healthy • Affordable
                                </p>
                            </div>
                            <div>
                                <h3>
                                    Quick Links
                                </h3>
                                <p>Home</p>
                                <p>Products</p>
                                <p>Orders</p>
                                <p>Wishlist</p>
                            </div>
                            <div>
                                <h3>
                                    Support
                                </h3>
                                <p>Help Center</p>
                                <p>Privacy Policy</p>
                                <p>Terms & Conditions</p>
                                <p>Contact Us</p>
                            </div>
                            <div>
                                <h3>
                                    Contact
                                </h3>
                                <p>
                                    📞 +91 9876543210
                                </p>
                                <p>
                                    ✉ support@kisanconnect.com
                                </p>
                                <p>
                                    📍 Hyderabad
                                </p>
                            </div>
                        </div>
                        <hr />
                        <div className="copyright">
                            © 2026 KisanConnect. All Rights Reserved.
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}