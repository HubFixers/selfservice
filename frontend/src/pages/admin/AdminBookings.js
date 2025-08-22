import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  };

  const markAsPaid = async (bookingId) => {
    setProcessingPayment(bookingId);
    try {
      const response = await axios.patch(`/api/admin/bookings/${bookingId}/pay`);
      toast.success('Booking marked as paid and receipt generated');
      
      // Update the booking in the state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'paid', receiptGenerated: true }
          : booking
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark booking as paid');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const viewPaymentProof = (booking) => {
    const imageUrl = booking.paymentProofImage || booking.giftCardImage;
    setSelectedImage({
      url: `http://localhost:5000${imageUrl}`,
      bookingId: booking._id,
      customerName: booking.customerName
    });
    setShowImageModal(true);
  };

  const downloadPaymentProof = async (bookingId) => {
    try {
      const response = await axios.get(`/api/admin/bookings/${bookingId}/payment-proof/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `payment-proof-${bookingId}.jpg`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Payment proof downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download payment proof');
    }
  };

  const sendReminder = async (bookingId) => {
    try {
      const response = await axios.post(`/api/admin/send-reminder/${bookingId}`);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    }
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
          <h1 className="text-3xl font-bold text-secondary-900">Bookings</h1>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {['all', 'unpaid', 'paid', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({bookings.filter(b => b.status === status).length})
                  </span>
                )}
                {status === 'all' && (
                  <span className="ml-1 text-xs">({bookings.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-secondary-500">
                      No bookings found for the selected filter
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {booking.customerEmail}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {booking.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900">
                          {booking.service?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-secondary-500">
                          ${booking.serviceRate || booking.service?.price || 0}/{booking.service?.priceUnit || 'hour'} × {booking.hoursNeeded || 1}h = ${booking.totalAmount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {booking.bookingTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.receiptGenerated && (
                          <div className="text-xs text-green-600 mt-1">Receipt Generated</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        <div className="font-medium">${booking.totalAmount || 0}</div>
                        <div className="text-xs text-secondary-500">
                          Retainer: ${booking.retainerAmount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'unpaid' && (
                            <button
                              onClick={() => markAsPaid(booking._id)}
                              disabled={processingPayment === booking._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {processingPayment === booking._id ? 'Processing...' : 'Mark Paid'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(booking._id);
                              toast.success('Booking ID copied to clipboard');
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Copy ID
                          </button>
                          
                          {(booking.paymentProofImage || booking.giftCardImage) && (
                            <>
                              <button
                                onClick={() => viewPaymentProof(booking)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Proof
                              </button>
                              <button
                                onClick={() => downloadPaymentProof(booking._id)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Download
                              </button>
                            </>
                          )}
                          
                          {!(booking.paymentProofImage || booking.giftCardImage) && (
                            <span className="text-secondary-400 text-xs">No proof uploaded</span>
                          )}

                          {booking.status === 'paid' && (
                            <button
                              onClick={() => sendReminder(booking._id)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Send Reminder
                            </button>
                          )}
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-2 text-xs text-secondary-500 max-w-xs truncate" title={booking.notes}>
                            Note: {booking.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">Total Revenue (Paid)</div>
            <div className="text-2xl font-bold text-green-600">
              ${bookings
                .filter(b => b.status === 'paid')
                .reduce((sum, b) => sum + (b.totalAmount || b.retainerAmount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">Pending Revenue</div>
            <div className="text-2xl font-bold text-yellow-600">
              ${bookings
                .filter(b => b.status === 'unpaid')
                .reduce((sum, b) => sum + (b.totalAmount || b.retainerAmount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => {
                const bookingDate = new Date(b.createdAt);
                const now = new Date();
                return bookingDate.getMonth() === now.getMonth() && 
                       bookingDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">Conversion Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {bookings.length > 0 
                ? Math.round((bookings.filter(b => b.status === 'paid').length / bookings.length) * 100)
                : 0}%
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">Payment Proof</h2>
                    <p className="text-secondary-600">
                      Booking ID: {selectedImage.bookingId} | Customer: {selectedImage.customerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-center">
                  <img
                    src={selectedImage.url}
                    alt="Payment Proof"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>

                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => downloadPaymentProof(selectedImage.bookingId)}
                    className="btn-primary"
                  >
                    Download Image
                  </button>
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Open in New Tab
                  </a>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;