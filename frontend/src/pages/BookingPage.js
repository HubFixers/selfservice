import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import "react-datepicker/dist/react-datepicker.css";

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: new Date(),
    bookingTime: '',
    hoursNeeded: 1,
    notes: ''
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Calculate total amount based on hours needed
  const totalAmount = service ? service.price * bookingData.hoursNeeded : 0;

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`/api/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Service not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: name === 'hoursNeeded' ? parseInt(value) || 1 : value
    });
  };

  const handleDateChange = (date) => {
    setBookingData({
      ...bookingData,
      bookingDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone || !bookingData.bookingTime || !bookingData.hoursNeeded) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (bookingData.hoursNeeded < 1 || bookingData.hoursNeeded > 24) {
      toast.error('Hours needed must be between 1 and 24');
      return;
    }

    // Navigate to checkout with booking data
    localStorage.setItem('bookingData', JSON.stringify({
      ...bookingData,
      serviceId: serviceId,
      service: service,
      totalAmount: totalAmount
    }));

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Service Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Service Header */}
            <div className="bg-primary-600 text-white p-6">
              <h1 className="text-3xl font-bold mb-2">Book {service.name}</h1>
              <p className="text-primary-100">{service.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">
                    ${service.price}
                    <span className="text-lg text-primary-200">/{service.priceUnit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary-200">Total Amount</div>
                  <div className="text-3xl font-bold">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={bookingData.customerName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-secondary-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={bookingData.customerEmail}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={bookingData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Service Duration */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Service Duration
                  </h3>
                  <div className="max-w-md">
                    <label htmlFor="hoursNeeded" className="block text-sm font-medium text-secondary-700 mb-2">
                      How many hours do you need? *
                    </label>
                    <select
                      id="hoursNeeded"
                      name="hoursNeeded"
                      value={bookingData.hoursNeeded}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'hour' : 'hours'} - ${((i + 1) * service.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-secondary-500 mt-1">
                      Rate: ${service.price}/{service.priceUnit} × {bookingData.hoursNeeded} {bookingData.hoursNeeded === 1 ? 'hour' : 'hours'} = ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Select Date & Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Preferred Date *
                      </label>
                      <DatePicker
                        selected={bookingData.bookingDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        className="input-field w-full"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                    <div>
                      <label htmlFor="bookingTime" className="block text-sm font-medium text-secondary-700 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        id="bookingTime"
                        name="bookingTime"
                        value={bookingData.bookingTime}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-secondary-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Any special requirements or notes..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-secondary"
                  >
                    Back to Services
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : `Continue to Checkout - $${totalAmount.toFixed(2)}`}
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

export default BookingPage;