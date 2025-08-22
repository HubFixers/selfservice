import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('bookingData');
    if (!storedData) {
      navigate('/');
      return;
    }
    setBookingData(JSON.parse(storedData));
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentProofFile) {
      toast.error('Please upload proof of payment before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Upload payment proof image
      setUploading(true);
      const formData = new FormData();
      formData.append('paymentProof', paymentProofFile);

      const uploadResponse = await axios.post('/api/upload/payment-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const paymentProofUrl = uploadResponse.data.fileUrl;
      setUploading(false);

      // Create booking with payment proof
      const response = await axios.post('/api/bookings', {
        ...bookingData,
        paymentProofImage: paymentProofUrl
      });

      // Clear stored booking data
      localStorage.removeItem('bookingData');

      // Navigate to confirmation page
      navigate(`/confirmation/${response.data.booking._id}`);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!bookingData || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary-600 text-white p-6">
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-primary-100">Complete your booking payment</p>
            </div>

            <div className="p-6">
              {/* Booking Summary */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Booking Summary</h2>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-600">Service</p>
                      <p className="font-semibold">{bookingData.service.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Customer</p>
                      <p className="font-semibold">{bookingData.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Date</p>
                      <p className="font-semibold">
                        {new Date(bookingData.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Time</p>
                      <p className="font-semibold">{bookingData.bookingTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Duration</p>
                      <p className="font-semibold">{bookingData.hoursNeeded} {bookingData.hoursNeeded === 1 ? 'hour' : 'hours'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Total Amount</p>
                      <p className="font-semibold text-lg text-primary-600">${bookingData.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Payment Information</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-red-800">Payment Required</h3>
                  </div>
                  <p className="text-red-700">
                    Please pay the full amount of <strong>${bookingData.totalAmount.toFixed(2)}</strong> and upload proof of payment to complete your booking.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* CashApp */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">CashApp</span>
                      Recommended
                    </h3>
                    <p className="text-secondary-600 mb-2">Send ${bookingData.totalAmount.toFixed(2)} to:</p>
                    <p className="font-mono text-lg font-semibold text-green-600">
                      {settings.paymentInstructions.cashApp}
                    </p>
                  </div>

                  {/* PayPal */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">PayPal</span>
                    </h3>
                    <p className="text-secondary-600 mb-2">Send ${bookingData.totalAmount.toFixed(2)} to:</p>
                    <p className="font-mono text-lg font-semibold text-blue-600">
                      {settings.paymentInstructions.paypal}
                    </p>
                  </div>

                  {/* Bank Transfer */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Bank Transfer</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-secondary-600">Account Name:</p>
                        <p className="font-semibold">{settings.paymentInstructions.bankTransfer.accountName}</p>
                      </div>
                      <div>
                        <p className="text-secondary-600">Account Number:</p>
                        <p className="font-mono font-semibold">{settings.paymentInstructions.bankTransfer.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-secondary-600">Routing Number:</p>
                        <p className="font-mono font-semibold">{settings.paymentInstructions.bankTransfer.routingNumber}</p>
                      </div>
                      <div>
                        <p className="text-secondary-600">Bank Name:</p>
                        <p className="font-semibold">{settings.paymentInstructions.bankTransfer.bankName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Proof Upload */}
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                    Upload Proof of Payment *
                  </h2>
                  <p className="text-secondary-600 mb-4">
                    <strong>Required:</strong> Upload a screenshot of successful payment or upload a gift card image if paying with gift card (Apple, Razer Gold, Steam, etc.)
                  </p>
                  <div className={`border-2 border-dashed rounded-lg p-6 ${paymentProofFile ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-proof-upload"
                      required
                    />
                    <label
                      htmlFor="payment-proof-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className={`h-12 w-12 mb-4 ${paymentProofFile ? 'text-green-500' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className={`text-center font-medium ${paymentProofFile ? 'text-green-700' : 'text-red-700'}`}>
                        {paymentProofFile ? `✓ ${paymentProofFile.name}` : 'Click to upload proof of payment (Required)'}
                      </p>
                      <p className="text-sm text-secondary-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </div>
                  {!paymentProofFile && (
                    <p className="text-red-600 text-sm mt-2">
                      ⚠️ You must upload proof of payment to complete your booking
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading || !paymentProofFile}
                    className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : uploading ? 'Uploading...' : `Complete Booking - $${bookingData.totalAmount.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;