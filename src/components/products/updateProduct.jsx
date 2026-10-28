import "./AddProduct.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams } from "react-router-dom";
const BASE_URL = "http://localhost:8080";
export default function UpdateProduct() {
    const [previewImage, setPreviewImage] = useState(null);
    const[product,setProduct]=useState({});

   
let params=useParams();


useEffect(() => {
if(localStorage.getItem("role")!=="FARMER"){
     navigate("/login");
}
}, [onload]);




useEffect(()=>{
axios.get(`${BASE_URL}/public/products/${params.pid}`,{
    headers:{
         Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
                        "Content-Type": "application/json"
    }
}).then((res)=>{
    setProduct(res.data);
    console.log(res.data);
    setPreviewImage(`${BASE_URL}/uploads/products/${res.data.productImage}`);
})
},[params.pid,product])



console.log(previewImage);

    const formik = useFormik({
        initialValues: {
            productName: product.productName,
            category: product.category,
            price: product.price,
            stock: product.stock,
            totalStock: product.totalStock,
            unit: product.unit,
            harvestDate: product.harvestDate,
            expiryDate: product.expiryDate,
            description: product.description,
            organic: false,
            image: null
        },
        enableReinitialize:true,
        validationSchema: yup.object({
            productName: yup.string()
                .required("Product Name Required"),
            category: yup.string()
                .required("Category Required"),
            price: yup.number()
                .required("Price Required")
                .positive(),
            stock: yup.number()
                .required("Stock Required")
                .min(1),
            totalStock: yup.number()
                .required("Total Stock Required")
                .min(1),
            unit: yup.string()
                .required(),
            harvestDate: yup.string()
                .required(),
            expiryDate: yup.string()
                .required(),
            description: yup.string()
                .required()
        }),
        onSubmit: (values) => {
            let formData = new FormData();
            formData.append("productName", values.productName);
            formData.append("category", values.category);
            formData.append("price", values.price);
            formData.append("stock", values.stock);
            formData.append("totalStock", values.totalStock);
            formData.append("unit", values.unit);
            formData.append("harvestDate", values.harvestDate);
            formData.append("expiryDate", values.expiryDate);
            formData.append("description", values.description);
            formData.append("organic", values.organic);
            if (values.image != null) {
                formData.append("image", values.image);
            }
            axios.put(
                `${BASE_URL}/farmer/products/update/${params.pid}`,
                formData,
                {
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            )
                .then((res) => {
                    alert(res.data);
                    formik.resetForm();
                    setPreviewImage(null);
                
                })
                .catch((err) => {
                    if (err.response) {
                        alert(err.response.data.message);
                    }
                    else {
                        alert("Server Error");
                    }
                });
        }
    });
    function imageHandler(e) {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue("image", file);
            setPreviewImage(URL.createObjectURL(file));
        }
    }
    return (
        <div className="add-product-page">
            <form onSubmit={formik.handleSubmit} className="add-product-container">
                <div className="form-section">
                    <div className="glass-card">
                        <h2>Product Images</h2>
                        <label className="upload-box">
                            {
                                previewImage ?
                                    <img
                                        src={previewImage}
                                        className="preview-image"
                                        alt=""
                                    />
                                    :
                                    <>
                                        <span className="material-symbols-outlined upload-icon">
                                            add_a_photo
                                        </span>
                                        <h4>Drag & Drop Image</h4>
                                        <p>PNG / JPG (Max 10 MB)</p>
                                    </>
                            }
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={imageHandler}
                            />
                        </label>
                    </div>
                    <div className="glass-card">
                        <h2>Product Information</h2>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    placeholder="Organic Mango"
                                    value={formik.values.productName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {
                                    formik.touched.productName &&
                                    <small>{formik.errors.productName}</small>
                                }
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formik.values.category}
                                    onChange={formik.handleChange}>
                                    <option value="">Select</option>
                                    <option value={"vegetables"}>vegetables</option>
                                    <option value={"Fruits"}>fruits</option>
                                    <option value={"Grains"}>frains</option>
                                    <option value={"Dairy"}>fairy</option>
                                    <option value={"Others"}>others</option>
                                </select>
                                {
                                    formik.touched.category &&
                                    <small>{formik.errors.category}</small>
                                }
                            </div>
                        </div>
                        <div className="grid-3">
                            <div className="input-group">
                                <label>Price</label>
                                <input type="number"
                                    name="price"
                                    value={formik.values.price} onChange={formik.handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Stock</label>
                                <input type="number" name="stock" value={formik.values.stock}
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Total Stock</label>
                                <input type="number" name="totalStock" value={formik.values.totalStock} onChange={formik.handleChange} />
                            </div>
                        </div>
                        <div className="grid-3">
                            <div className="input-group">
                                <label>Unit</label>
                                <select name="unit" value={formik.values.unit} onChange={formik.handleChange}>
                                    <option value="kg">Kilogram</option>
                                    <option value="g">Gram</option>
                                    <option value="piece">Piece</option>
                                    <option value="litre">Litre</option>
                                    <option value="bunch">Bunch</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Harvest Date</label>
                                <input type="date" name="harvestDate" value={formik.values.harvestDate} onChange={formik.handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Expiry Date</label>
                                <input type="date" name="expiryDate" value={formik.values.expiryDate} onChange={formik.handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea rows="5" name="description" value={formik.values.description} onChange={formik.handleChange} placeholder="Describe your product..." />
                        </div>
                        <div className="organic-box">
                            <div>
                                <h4>Certified Organic</h4>
                                <p> Show customers that this product is organic.</p>
                            </div>
                            <input type="checkbox" name="organic" checked={formik.values.organic} onChange={formik.handleChange} />
                        </div>
                        <div className="button-group">
                            <button type="button" className="draft-btn"> Save Draft</button>
                            <button type="submit" className="publish-btn" >  Publish Product</button>
                        </div>
                    </div>
                </div>
                <div className="preview-section">
                    <h2 className="preview-title">Live Preview </h2>
                    <div className="glass-card preview-card">
                        <div className="preview-image-box">
                            {
                                previewImage ?
                                    <img src={previewImage} alt="" className="preview-image-large" />
                                    :
                                    <div className="default-preview">
                                        <span className="material-symbols-outlined">
                                            image
                                        </span>
                                        <p>No Image Selected</p>
                                    </div>
                            }
                            {
                                formik.values.organic &&
                                <div className="organic-badge1">
                                    <span className="material-symbols-outlined">eco </span>
                                    Organic
                                </div>
                            }
                        </div>
                        <div className="preview-content">
                            <div className="preview-top">
                                <div>
                                    <p className="category-text">
                                        {
                                            formik.values.category ||
                                            "CATEGORY"
                                        }
                                    </p>
                                    <h2>
                                        {
                                            formik.values.productName ||
                                            "Product Name"
                                        }
                                    </h2>
                                </div>
                                <div className="price-box">
                                    ₹
                                    {
                                        formik.values.price ||
                                        0
                                    }
                                </div>
                            </div>
                            <div className="preview-info">
                                <div>
                                    <span>Stock</span>
                                    <h4>
                                        {
                                            formik.values.stock ||
                                            0
                                        }
                                    </h4>
                                </div>
                                <div>
                                    <span>Total Stock</span>
                                    <h4>
                                        {
                                            formik.values.totalStock ||
                                            0
                                        }
                                    </h4>
                                </div>
                            </div>
                            <div className="preview-info">
                                <div>
                                    <span>Unit</span>
                                    <h4>
                                        {
                                            formik.values.unit ||
                                            "kg"
                                        }
                                    </h4>
                                </div>
                                <div>
                                    <span>Harvest</span>
                                    <h4>
                                        {
                                            formik.values.harvestDate ||
                                            "--"
                                        }
                                    </h4>
                                </div>
                            </div>
                            <div className="preview-info">
                                <div>
                                    <span>Expiry</span>
                                    <h4>
                                        {
                                            formik.values.expiryDate ||
                                            "--"
                                        }
                                    </h4>
                                </div>
                            </div>
                            <div className="description-box">
                                {
                                    formik.values.description ||
                                    "Your product description will appear here as you type..."
                                }
                            </div>
                            <button
                                type="button"
                                className="cart-btn"
                            >
                                <span className="material-symbols-outlined">
                                    shopping_cart
                                </span>
                                Add To Cart
                            </button>
                        </div>
                    </div>
                    <div className="tips-card">
                        <span className="material-symbols-outlined">
                            lightbulb
                        </span>
                        <div>
                            <h4>Seller Tips</h4>
                            <p>
                                Products with clear images and detailed descriptions
                                usually receive more customer attention.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}