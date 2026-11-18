import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import farmerService from '../../services/farmerService';
import productService from '../../services/productService';
import { resolveProductImageUrl } from '../../utils/formatters';

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Dairy',
  'Spices',
  'Herbs',
  'Honey & Sweeteners',
];

const UNITS = [
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Grams (g)', value: 'g' },
  { label: 'Pieces (pc)', value: 'piece' },
  { label: 'Liters (L)', value: 'liter' },
  { label: 'Bunch / Bundle', value: 'bunch' },
];

export const UpdateProduct = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const [initialData, setInitialData] = useState({
    productName: '',
    category: '',
    price: '',
    stock: '',
    totalStock: '',
    unit: 'kg',
    harvestDate: '',
    expiryDate: '',
    description: '',
    organic: false,
    image: null,
  });

  // Fetch Existing Product Data
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setErrorNotice('');
        const data = await productService.getProductById(pid);
        if (isMounted && data) {
          setInitialData({
            productName: data.productName || data.name || '',
            category: data.category || '',
            price: data.price || '',
            stock: data.stock || '',
            totalStock: data.totalStock || data.stock || '',
            unit: data.unit || 'kg',
            harvestDate: data.harvestDate ? data.harvestDate.substring(0, 10) : '',
            expiryDate: data.expiryDate ? data.expiryDate.substring(0, 10) : '',
            description: data.description || '',
            organic: Boolean(data.organic),
            image: null,
          });

          if (data.productImage || data.image) {
            setPreviewImage(resolveProductImageUrl(data.productImage || data.image));
          }
        }
      } catch (err) {
        console.error('Failed to load product details for editing:', err);
        if (isMounted) setErrorNotice('Could not load product details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [pid]);

  const formik = useFormik({
    initialValues: initialData,
    enableReinitialize: true,
    validationSchema: yup.object({
      productName: yup
        .string()
        .trim()
        .min(2, 'Product name must be at least 2 characters')
        .required('Product Name is required'),
      category: yup.string().required('Category is required'),
      price: yup
        .number()
        .typeError('Price must be a valid number')
        .positive('Price must be greater than zero')
        .required('Price per unit is required'),
      stock: yup
        .number()
        .typeError('Stock must be a number')
        .min(0, 'Available stock cannot be negative')
        .required('Available stock is required'),
      totalStock: yup
        .number()
        .typeError('Total stock must be a number')
        .min(1, 'Total harvest stock must be at least 1')
        .required('Total harvest stock is required'),
      unit: yup.string().required('Measurement unit is required'),
      harvestDate: yup.string().required('Harvest date is required'),
      expiryDate: yup.string().required('Expiry / Best before date is required'),
      description: yup
        .string()
        .trim()
        .min(10, 'Description should be at least 10 characters')
        .required('Harvest description is required'),
      organic: yup.boolean(),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setErrorNotice('');
        setSuccessNotice('');

        const formData = new FormData();
        formData.append('productName', values.productName);
        formData.append('category', values.category);
        formData.append('price', values.price);
        formData.append('stock', values.stock);
        formData.append('totalStock', values.totalStock);
        formData.append('unit', values.unit);
        formData.append('harvestDate', values.harvestDate);
        formData.append('expiryDate', values.expiryDate);
        formData.append('description', values.description);
        formData.append('organic', values.organic);

        if (values.image) {
          formData.append('image', values.image);
        }

        const response = await farmerService.updateProduct(pid, formData);
        setSuccessNotice(
          typeof response === 'string'
            ? response
            : 'Harvest produce listing updated successfully!'
        );

        setTimeout(() => {
          navigate('/dashboard/products');
        }, 1500);
      } catch (err) {
        console.error('Failed to update product:', err);
        setErrorNotice(
          err.response?.data?.message ||
            'Failed to update harvest product. Please check the fields and try again.'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorNotice('Image file size must be less than 5MB.');
        return;
      }
      formik.setFieldValue('image', file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center my-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted small fw-semibold">Loading harvest record #{pid}...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-pencil-square"></i> Modify Harvest
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Update Produce Listing</h2>
          <p className="text-muted small mb-0">
            Edit stock availability, adjust pricing, or update harvest photography.
          </p>
        </div>

        <Link to="/dashboard/products" className="kc-btn kc-btn-outline kc-btn-sm align-self-start align-self-sm-auto">
          <i className="bi bi-arrow-left me-1"></i> Back to Inventory
        </Link>
      </div>

      {/* Alerts */}
      {successNotice && (
        <div
          className="alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: 'var(--kc-fresh-green-subtle)', color: 'var(--kc-fresh-green)' }}
        >
          <i className="bi bi-check-circle-fill fs-5"></i>
          <span className="fw-semibold">{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div
          className="alert border-0 shadow-sm p-3 rounded-4 mb-4 d-flex align-items-center gap-2"
          style={{ backgroundColor: 'var(--kc-crimson-red-subtle)', color: 'var(--kc-crimson-red)' }}
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={formik.handleSubmit}>
        <div className="row g-4">
          {/* Left Column: Produce Details */}
          <div className="col-lg-8">
            <div className="kc-card p-4 mb-4 shadow-sm">
              <h4 className="fw-bold text-dark mb-3">General Harvest Information</h4>

              <div className="row g-3">
                {/* Product Name */}
                <div className="col-md-8">
                  <label className="form-label small fw-semibold text-dark">
                    Produce Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    className={`form-control kc-input ${
                      formik.touched.productName && formik.errors.productName ? 'is-invalid' : ''
                    }`}
                    value={formik.values.productName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.productName && formik.errors.productName && (
                    <div className="invalid-feedback">{formik.errors.productName}</div>
                  )}
                </div>

                {/* Category */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category"
                    className={`form-select kc-input ${
                      formik.touched.category && formik.errors.category ? 'is-invalid' : ''
                    }`}
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="invalid-feedback">{formik.errors.category}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">
                    Harvest Story & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    className={`form-control kc-input ${
                      formik.touched.description && formik.errors.description ? 'is-invalid' : ''
                    }`}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  )}
                </div>

                {/* Organic Checkbox */}
                <div className="col-12">
                  <div
                    className="p-3 rounded-4 d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: 'var(--kc-cream)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-success"
                        style={{ width: '40px', height: '40px', backgroundColor: 'var(--kc-fresh-green-subtle)' }}
                      >
                        <i className="bi bi-patch-check-fill fs-5"></i>
                      </div>
                      <div>
                        <strong className="text-dark d-block">100% Certified Organic</strong>
                        <small className="text-muted">Grown without synthetic pesticides or chemicals</small>
                      </div>
                    </div>
                    <div className="form-check form-switch fs-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="organic"
                        role="switch"
                        checked={formik.values.organic}
                        onChange={formik.handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock Details */}
            <div className="kc-card p-4 shadow-sm">
              <h4 className="fw-bold text-dark mb-3">Pricing & Batch Inventory</h4>

              <div className="row g-3">
                {/* Price */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Price per Unit (₹) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-success fw-bold border-0">₹</span>
                    <input
                      type="number"
                      step="any"
                      name="price"
                      className={`form-control kc-input ${
                        formik.touched.price && formik.errors.price ? 'is-invalid' : ''
                      }`}
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.price && formik.errors.price && (
                      <div className="invalid-feedback">{formik.errors.price}</div>
                    )}
                  </div>
                </div>

                {/* Unit */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Measurement Unit <span className="text-danger">*</span>
                  </label>
                  <select
                    name="unit"
                    className={`form-select kc-input ${
                      formik.touched.unit && formik.errors.unit ? 'is-invalid' : ''
                    }`}
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  {formik.touched.unit && formik.errors.unit && (
                    <div className="invalid-feedback">{formik.errors.unit}</div>
                  )}
                </div>

                {/* Available Stock */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Available Stock to Sell <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    className={`form-control kc-input ${
                      formik.touched.stock && formik.errors.stock ? 'is-invalid' : ''
                    }`}
                    value={formik.values.stock}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.stock && formik.errors.stock && (
                    <div className="invalid-feedback">{formik.errors.stock}</div>
                  )}
                </div>

                {/* Total Stock */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Total Harvest Batch Stock <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    className={`form-control kc-input ${
                      formik.touched.totalStock && formik.errors.totalStock ? 'is-invalid' : ''
                    }`}
                    value={formik.values.totalStock}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.totalStock && formik.errors.totalStock && (
                    <div className="invalid-feedback">{formik.errors.totalStock}</div>
                  )}
                </div>

                {/* Harvest Date */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Harvest Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    className={`form-control kc-input ${
                      formik.touched.harvestDate && formik.errors.harvestDate ? 'is-invalid' : ''
                    }`}
                    value={formik.values.harvestDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.harvestDate && formik.errors.harvestDate && (
                    <div className="invalid-feedback">{formik.errors.harvestDate}</div>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Best Before / Expiry Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    className={`form-control kc-input ${
                      formik.touched.expiryDate && formik.errors.expiryDate ? 'is-invalid' : ''
                    }`}
                    value={formik.values.expiryDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.expiryDate && formik.errors.expiryDate && (
                    <div className="invalid-feedback">{formik.errors.expiryDate}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image Upload & Submission */}
          <div className="col-lg-4">
            <div className="kc-card p-4 mb-4 shadow-sm">
              <h4 className="fw-bold text-dark mb-3">Produce Photography</h4>
              <p className="text-muted small mb-3">
                Update or maintain your real harvest photo.
              </p>

              {/* Photo Preview Canvas */}
              <div
                className="rounded-4 overflow-hidden position-relative mb-3 d-flex align-items-center justify-content-center text-center cursor-pointer border"
                style={{
                  height: '240px',
                  backgroundColor: 'var(--kc-cream)',
                  borderColor: 'var(--kc-border-subtle)',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="p-3">
                    <i className="bi bi-camera text-success display-4 d-block mb-2"></i>
                    <strong className="text-dark d-block small">Click to Choose Photo</strong>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleImageChange}
              />

              <button
                type="button"
                className="kc-btn kc-btn-outline kc-btn-sm w-100 mb-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="bi bi-upload me-1"></i>
                {previewImage ? 'Replace Photo' : 'Select Produce Photo'}
              </button>

              <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--kc-cream)' }}>
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-info-circle text-success me-1"></i>
                  Leave image unselected to keep the existing photo intact.
                </small>
              </div>
            </div>

            {/* Submit Card */}
            <div className="kc-card p-4 shadow-sm">
              <button
                type="submit"
                disabled={submitting}
                className="kc-btn kc-btn-primary w-100 mb-2 py-2.5 fw-bold"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> Update Harvest Listing
                  </>
                )}
              </button>

              <Link
                to="/dashboard/products"
                className="kc-btn kc-btn-outline kc-btn-sm w-100 text-center"
              >
                Cancel & Return
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
