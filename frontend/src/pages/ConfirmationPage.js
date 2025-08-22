import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Booking Not Found</h2>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-600 text-white p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-green-100">
                Your booking has been successfully created and is pending payment confirmation.
              </p>
            </div>

            <div className="p-6">
              {/* Booking Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Booking Details</h2>
                <div className="bg-secondary-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-2">Service Information</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-secondary-600">Service:</span>
                          <span className="ml-2 font-medium">{booking.service.name}</span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Price:</span>
                          <span className="ml-2 font-medium">
                            ${booking.service.price}/{booking.service.priceUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-2">Customer Information</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-secondary-600">Name:</span>
                          <span className="ml-2 font-medium">{booking.customerName}</span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Email:</span>
                          <span className="ml-2 font-medium">{booking.customerEmail}</span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Phone:</span>
                          <span className="ml-2 font-medium">{booking.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-2">Appointment Details</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-secondary-600">Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Time:</span>
                          <span className="ml-2 font-medium">{booking.bookingTime}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-2">Payment Information</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-secondary-600">Booking ID:</span>
                          <span className="ml-2 font-mono text-sm">{booking._id}</span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Retainer Amount:</span>
                          <span className="ml-2 font-medium">${booking.retainerAmount}</span>
                        </div>
                        <div>
                          <span className="text-secondary-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="font-semibold text-secondary-900 mb-2">Additional Notes</h3>
                      <p className="text-secondary-600">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">What's Next?</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Payment Confirmation</p>
                        <p className="text-blue-700 text-sm">
                          We will review your payment and confirm your booking within 24 hours.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Email Confirmation</p>
                        <p className="text-blue-700 text-sm">
                          You'll receive an email confirmation once your payment is verified.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Service Delivery</p>
                        <p className="text-blue-700 text-sm">
                          We'll contact you before your appointment to confirm details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Need Help?</h2>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <p className="text-secondary-600 mb-2">
                    If you have any questions about your booking, please don't hesitate to contact us:
                  </p>
                  <div className="space-y-1">
                    <p className="text-secondary-700">
                      <span className="font-medium">Email:</span> support@servicepro.com
                    </p>
                    <p className="text-secondary-700">
                      <span className="font-medium">Phone:</span> (555) 123-4567
                    </p>
                    <p className="text-secondary-700">
                      <span className="font-medium">Booking ID:</span> 
                      <span className="font-mono text-sm ml-1">{booking._id}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/" className="btn-primary text-center">
                  Back to Home
                </Link>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary text-center"
                >
                  Print Confirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmationPage;