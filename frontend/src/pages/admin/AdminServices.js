import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    priceUnit: 'hour',
    image: '',
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/admin/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('serviceImage', file);

    try {
      const response = await axios.post('/api/upload/service', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData({
        ...formData,
        image: response.data.fileUrl
      });
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service
        const response = await axios.put(`/api/admin/services/${editingService._id}`, formData);
        setServices(services.map(service => 
          service._id === editingService._id ? response.data.service : service
        ));
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const response = await axios.post('/api/admin/services', formData);
        setServices([response.data.service, ...services]);
        toast.success('Service created successfully');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      shortDescription: service.shortDescription,
      price: service.price.toString(),
      priceUnit: service.priceUnit,
      image: service.image,
      isActive: service.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/services/${serviceId}`);
      setServices(services.filter(service => service._id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      priceUnit: 'hour',
      image: '',
      isActive: true
    });
    setEditingService(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Services</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Add New Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow overflow-hidden">
              {service.image && (
                <div className="h-48 bg-secondary-200 overflow-hidden">
                  <img
                    src={`https://selfservice-q5fd.onrender.com${service.image}`}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {service.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-secondary-600 text-sm mb-3">
                  {service.shortDescription}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-primary-600">
                    ${service.price}
                    <span className="text-sm text-secondary-500">/{service.priceUnit}</span>
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-500 text-lg">No services found</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              Create Your First Service
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="e.g., Web Development"
                    />
                  </div>

                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-secondary-700 mb-2">
                      Short Description * (Max 150 characters)
                    </label>
                    <input
                      type="text"
                      id="shortDescription"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      required
                      maxLength={150}
                      className="input-field"
                      placeholder="Brief description for service cards"
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      {formData.shortDescription.length}/150 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Detailed description of the service"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="input-field"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="priceUnit" className="block text-sm font-medium text-secondary-700 mb-2">
                        Price Unit
                      </label>
                      <select
                        id="priceUnit"
                        name="priceUnit"
                        value={formData.priceUnit}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="hour">per hour</option>
                        <option value="session">per session</option>
                        <option value="project">per project</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-secondary-700 mb-2">
                      Service Image
                    </label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {uploading && (
                      <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                    )}
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={`https://selfservice-q5fd.onrender.com${formData.image}`}
                          alt="Service preview"
                          className="h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-secondary-900">
                      Service is active and visible to customers
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServices;