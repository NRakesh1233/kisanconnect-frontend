import React, { useState, useEffect } from 'react';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Addresses() {
  const { totalItemsCount } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Address Form State aligned with AddressResponse fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    houseNo: '',
    street: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'HOME' // Default type
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAddresses();
      setAddresses(data || []);
    } catch (err) {
      console.warn('Failed to fetch addresses from backend, using empty list.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await customerService.addAddress(formData);
      setSuccessMsg('Address added successfully!');
      setFormData({
        fullName: '',
        mobileNumber: '',
        houseNo: '',
        street: '',
        village: '',
        mandal: '',
        district: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'HOME'
      });
      setShowAddForm(false);
      fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to save address. Please check all fields.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await customerService.deleteAddress(addressId);
      fetchAddresses();
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <CustomerNavbar cartCount={totalItemsCount} />

      <main className="container py-5 flex-grow-1" style={{marginTop:"100px"}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark mb-0">
            <i className="bi bi-geo-alt text-success me-2"></i>Delivery Addresses
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-kisan-primary d-flex align-items-center gap-1"
          >
            <i className={`bi bi-${showAddForm ? 'x' : 'plus'}-lg`}></i>
            <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="alert alert-success fs-7 mb-4 text-center" role="alert">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-danger fs-7 mb-4 text-center" role="alert">
            {error}
          </div>
        )}

        {/* Add Address Form Collapse */}
        {showAddForm && (
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white animate-fade-in">
            <h5 className="fw-bold text-dark mb-3">Add New Delivery Location</h5>
            <form onSubmit={handleAddAddress}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fs-7 fw-medium">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fs-7 fw-medium">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">House No / Flat</label>
                  <input
                    type="text"
                    className="form-control"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label fs-7 fw-medium">Street Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">Village</label>
                  <input
                    type="text"
                    className="form-control"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">Mandal</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mandal"
                    value={formData.mandal}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">District</label>
                  <input
                    type="text"
                    className="form-control"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">State</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fs-7 fw-medium">Address Type (HOME/WORK)</label>
                  <select
                    className="form-select"
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleInputChange}
                  >
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="FARM">FARM</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label fs-7 fw-medium">Landmark (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="e.g. Near Water Tank"
                  />
                </div>
                <div className="col-12 text-end mt-3">
                  <button type="submit" className="btn btn-kisan-primary px-4">
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5 rounded-4 bg-white">
            <div className="card-body">
              <i className="bi bi-geo text-muted display-4 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No delivery addresses saved</h5>
              <p className="text-muted">Add your delivery location to streamline order checkout.</p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {addresses.map((addr) => (
              <div key={addr.addressId} className="col">
               <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white position-relative">
  {/* Header Row: Address Type & Delete Button */}
  <div className="d-flex justify-content-between align-items-center w-100 mb-2">
    <span className="badge bg-light text-success border border-success fs-8" mb-2>
      {addr.addressType || 'ADDRESS'}
    </span>
    <button
      onClick={() => handleDeleteAddress(addr.addressId)}
      className="btn btn-sm btn-outline-danger border-0 p-1 position-absolute top-0 end-0 m-2"
      title="Delete address"
    >
      <i className="bi bi-trash fs-5"></i>
    </button>
  </div>
                  
                  <h6 className="fw-bold text-dark mb-1">{addr.fullName}</h6>
                  <p className="text-muted fs-7 mb-2">
                    {addr.fullAddress || `${addr.houseNo || ''}, ${addr.street}, ${addr.village ? addr.village + ',' : ''} ${addr.district}, ${addr.state} - ${addr.pincode}`}
                  </p>
                  {addr.landmark && (
                    <p className="text-muted fs-8 mb-2">
                      <strong>Landmark:</strong> {addr.landmark}
                    </p>
                  )}
                  <p className="text-muted fs-7 mb-0">
                    <i className="bi bi-telephone text-success me-1"></i> {addr.mobileNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}