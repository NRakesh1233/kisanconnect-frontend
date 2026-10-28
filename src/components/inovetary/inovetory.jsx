import "./inovetory.css";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadDashboard } from "../../service";
import { Navbar } from "../navbar/navbar";
import gsap from "gsap";
import {
    FaPlus,
    FaSearch,
    FaThLarge,
    FaList,
    FaBoxOpen,
    FaRupeeSign
} from "react-icons/fa";
import {
    MdInventory2,
    MdWarningAmber
} from "react-icons/md";

export default function FarmerProducts() {
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:8080";

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [view, setView] = useState("grid");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("Newest");

    const [stats, setStats] = useState({
        totalProducts: 0,
        outOfStock: 0,
        lowStock: 0
    });

    const [statsTotal, setStatsTotal] = useState({
        products: [],
        orders: [],
        revenue: 0,
        rating: 0
    });

    const containerRef = useRef(null);

    useEffect(() => {
        if (localStorage.getItem("role") !== "FARMER") {
            navigate("/login");
        }
    }, [navigate]);

    async function fetchDashboard() {
        try {
            const [a] = await loadDashboard();
            setStatsTotal(a);
            setProducts(a.products || []);
            setFilteredProducts(a.products || []);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    }

    useEffect(() => {
        fetchDashboard();
    }, []);

    // GSAP Entrance Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".inventory-header", {
                y: -20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
            gsap.from(".stats-card", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });
            gsap.from(".toolbar", {
                y: 15,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.3
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Filter & Sort Products
    useEffect(() => {
        let data = [...products];

        if (category.toLowerCase() !== "all") {
            data = data.filter(item => item.category?.toLowerCase() === category.toLowerCase());
        }

        if (search !== "") {
            data = data.filter(item =>
                (item.productName || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        switch (sort) {
            case "Price Low":
                data.sort((a, b) => a.price - b.price);
                break;
            case "Price High":
                data.sort((a, b) => b.price - a.price);
                break;
            case "Stock":
                data.sort((a, b) => b.stock - a.stock);
                break;
            default:
                break;
        }

        setFilteredProducts(data);
    }, [products, category, search, sort]);

    // Calculate Stock Stats
    useEffect(() => {
        let out = 0;
        let low = 0;

        products.forEach(item => {
            if (item.stock === 0) out++;
            else if (item.stock < 10) low++;
        });

        setStats({
            totalProducts: products.length,
            outOfStock: out,
            lowStock: low
        });
    }, [products]);

    return (
        <div ref={containerRef}>
            <Navbar menu={["Dashboard", "Inventory", "Orders", "Profile"]} role="FARMER" />

            <div className="inventory-page">
                {/* ================= HEADER ================= */}
                <div className="inventory-header">
                    <div>
                        <h1>Inventory Management</h1>
                        <p className="text-muted">Monitor, manage and optimize your farm products.</p>
                    </div>
                    <Link to="add" style={{ textDecoration: "none" }}>
                        <button className="add-btn btn btn-success d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold shadow-sm">
                            <FaPlus /> Add Product
                        </button>
                    </Link>
                </div>

                {/* ================= STATISTICS CARDS ================= */}
                <div className="stats-container">
                    <div className="stats-card">
                        <div className="stats-icon green">
                            <MdInventory2 />
                        </div>
                        <div>
                            <span className="stats-label">Total Products</span>
                            <h2 className="stats-value">{stats.totalProducts}</h2>
                        </div>
                    </div>
                    <div className="stats-card">
                        <div className="stats-icon red">
                            <FaBoxOpen />
                        </div>
                        <div>
                            <span className="stats-label">Out Of Stock</span>
                            <h2 className="stats-value">{stats.outOfStock}</h2>
                        </div>
                    </div>
                    <div className="stats-card">
                        <div className="stats-icon orange">
                            <MdWarningAmber />
                        </div>
                        <div>
                            <span className="stats-label">Low Stock</span>
                            <h2 className="stats-value">{stats.lowStock}</h2>
                        </div>
                    </div>
                    <div className="stats-card">
                        <div className="stats-icon money">
                            <FaRupeeSign />
                        </div>
                        <div>
                            <span className="stats-label">Total Revenue</span>
                            <h2 className="stats-value">₹ {statsTotal.revenue || 0}</h2>
                        </div>
                    </div>
                </div>

                {/* ================= TOOLBAR ================= */}
                <div className="toolbar">
                    <div className="search-box">
                        <FaSearch className="text-muted" />
                        <input
                        className="text-success"
                        id="my-input"
                            type="text"
                            placeholder="Search Product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{color:"green"}}
                        />
                    </div>
                    
                    <select
                        className="form-select w-auto rounded-pill px-3 shadow-none border-0 bg-light"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>All</option>
                        <option>Fruits</option>
                        <option>Vegetables</option>
                        <option>Grains</option>
                        <option>Dairy</option>
                    </select>

                    <select
                        className="form-select w-auto rounded-pill px-3 shadow-none border-0 bg-light"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option>Newest</option>
                        <option>Price Low</option>
                        <option>Price High</option>
                        <option>Stock</option>
                    </select>

                    <div className="view-buttons d-flex gap-1">
                        <button
                            className={`btn btn-sm rounded-circle p-2 ${view === "grid" ? "btn-success" : "btn-light text-secondary"}`}
                            onClick={() => setView("grid")}
                        >
                            <FaThLarge />
                        </button>
                        <button
                            className={`btn btn-sm rounded-circle p-2 ${view === "list" ? "btn-success" : "btn-light text-secondary"}`}
                            onClick={() => setView("list")}
                        >
                            <FaList />
                        </button>
                    </div>
                </div>

                {/* ================= PRODUCT GRID / LIST ================= */}
                <div className={view === "grid" ? "product-grid" : "product-list"}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((item) => (
                            <div className="product-card glass-card shadow-sm rounded-4 overflow-hidden bg-white mb-4" key={item.productId}>
                                <div className="product-image position-relative">
                                    <img
                                        src={`${BASE_URL}/uploads/products/${item.productImage}`}
                                        alt={item.productName}
                                        className="w-100 object-fit-cover"
                                        style={{ height: "190px" }}
                                    />
                                    <span className={`badge position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm ${
                                        item.stock === 0 ? "bg-danger" : item.stock < 10 ? "bg-warning text-dark" : "bg-success"
                                    }`}>
                                        {item.stock === 0 ? "Out Of Stock" : item.stock < 10 ? "Low Stock" : "In Stock"}
                                    </span>
                                </div>
                                <div className="product-body p-4">
                                    <div className="title-row d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="fw-bold fs-5 mb-0 text-dark">{item.productName}</h3>
                                        <h2 className="text-success fw-bold fs-4 mb-0">₹ {item.price}</h2>
                                    </div>
                                    <p className="category fw-bold text-success small mb-2">{item.category}</p>
                                    <p className="description text-muted small mb-3">{item.description}</p>
                                    
                                    <div className="stock-box d-flex justify-content-between bg-light p-3 rounded-3 mb-3">
                                        <div className="mx-3">
                                            <span className="text-muted d-block" style={{fontSize:"10px"}}>Available Stock</span>
                                            <h4 className="fw-bold mb-0 text-dark fs-6">{item.stock} kg</h4>
                                        </div>
                                        <div>
                                            <span className="text-muted  d-block" style={{fontSize:"10px"}}>Total Stock</span>
                                            <h4 className="fw-bold mb-0 text-dark fs-6">{item.totalStock} kg</h4>
                                        </div>
                                    </div>

                                    <div className="dates d-flex justify-content-between text-muted small mb-3">
                                        <div>
                                            <small className="d-block">Harvest</small>
                                            <strong className="text-dark">{item.harvestDate}</strong>
                                        </div>
                                        <div>
                                            <small className="d-block">Expiry</small>
                                            <strong className="text-dark">{item.expiryDate}</strong>
                                        </div>
                                    </div>

                                    <div className="rating-row mb-3 text-warning">
                                        ⭐ {item.avgRating?.toFixed(1) || 0}
                                        <span className="text-muted small ms-1">({item.reviewCount || 0} Reviews)</span>
                                    </div>

                                    <div className="product-actions d-flex gap-2">
                                        <Link to={`update/${item.productId}`} className="flex-grow-1 text-decoration-none">
                                            <button className="edit-btn btn btn-outline-success w-100 rounded-pill fw-medium">Edit</button>
                                        </Link>
                                        <button className="delete-btn btn btn-outline-danger flex-grow-1 rounded-pill fw-medium">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-products text-center py-5 w-100">
                            <h2 className="fw-bold text-dark">No Products Found</h2>
                            <p className="text-muted">Try changing search or category filters.</p>
                        </div>
                    )}
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="pagination d-flex justify-content-center gap-2 mt-4">
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">Prev</button>
                    <button className="btn btn-success btn-sm rounded-pill px-3 active">1</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">2</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">3</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">Next</button>
                </div>
            </div>
        </div>
    );
}