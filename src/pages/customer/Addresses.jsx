import React, { useState, useEffect } from 'react';
import customerService from '../../services/customerService';

export const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    addressType: 'HOME',
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch addresses:', err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      await customerService.addAddress(formData);
      setSuccessMsg('Delivery address saved successfully!');
      setShowAddForm(false);
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
        addressType: 'HOME',
      });
      await fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('Failed to save address. Please review all fields.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await customerService.deleteAddress(addressId);
      setSuccessMsg('Address removed.');
      await fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Could not delete address.');
    }
  };

  return (
    <div className="kc-container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <span className="kc-section-badge mb-1">
            <i className="bi bi-geo-alt"></i> Shipping Destinations
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Delivery Addresses</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="kc-btn kc-btn-primary kc-btn-sm align-self-start align-self-sm-auto"
        >
          <i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 rounded-4 small py-2.5 px-3 mb-4 shadow-sm">
          <i className="bi bi-check-circle-fill me-1"></i> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger border-0 rounded-4 small py-2.5 px-3 mb-4 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
        </div>
      )}

      {/* Add Address Form Accordion */}
      {showAddForm && (
        <div className="kc-card p-4 mb-4 shadow-sm">
          <h5 className="fw-bold text-dark mb-3">New Delivery Address</h5>
          <form onSubmit={handleAddAddress}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="kc-label small">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Ramesh Patel"
                  className="kc-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6">
                <label className="kc-label small">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                  className="kc-input"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6">
                <label className="kc-label small">House / Flat / Door No.</label>
                <input
                  type="text"
                  name="houseNo"
                  required
                  placeholder="e.g. 12-4/A"
                  className="kc-input"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6">
                <label className="kc-label small">Street Name / Colony</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="Street"
                  className="kc-input"
                  value={formData.street}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label className="kc-label small">Village / City</label>
                <input
                  type="text"
                  name="village"
                  required
                  className="kc-input"
                  value={formData.village}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label className="kc-label small">District</label>
                <input
                  type="text"
                  name="district"
                  required
                  className="kc-input"
                  value={formData.district}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label className="kc-label small">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  className="kc-input"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6">
                <label className="kc-label small">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  placeholder="6-digit Pincode"
                  className="kc-input"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6">
                <label className="kc-label small">Address Tag</label>
                <select
                  name="addressType"
                  className="kc-select"
                  value={formData.addressType}
                  onChange={handleInputChange}
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work / Office</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-end">
              <button
                type="button"
                className="btn btn-link text-muted me-2"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="kc-btn kc-btn-primary kc-btn-sm">
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="row g-4">
          {addresses.map((addr) => {
            const aid = addr.addressId || addr.id;

            return (
              <div key={aid} className="col-md-6 col-lg-4">
                <div className="kc-card p-4 h-100 d-flex flex-column shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge kc-badge-cream">{addr.addressType || 'HOME'}</span>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0 text-decoration-none small"
                      onClick={() => handleDeleteAddress(aid)}
                      title="Delete Address"
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>

                  <strong className="text-dark d-block mb-1">{addr.fullName}</strong>
                  <p className="text-muted small mb-2 flex-grow-1">
                    {addr.houseNo}, {addr.street}, {addr.village}, {addr.district || ''}, {addr.state} - {addr.pincode}
                  </p>

                  <div className="pt-2 border-top small text-muted">
                    <i className="bi bi-telephone text-success me-1"></i> {addr.mobileNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="kc-card p-5 text-center shadow-sm">
          <i className="bi bi-geo-alt text-muted display-4 d-block mb-3 opacity-50"></i>
          <h5 className="fw-bold text-dark mb-1">No Saved Addresses</h5>
          <p className="text-muted small mb-3">Add a delivery destination to speed up future checkout.</p>
          <button
            type="button"
            className="kc-btn kc-btn-primary kc-btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            Add Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
