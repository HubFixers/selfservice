import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('https://selfservice-q5fd.onrender.com/api/admin/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await axios.patch(`/api/admin/contacts/${contactId}/read`);
      setContacts(contacts.map(contact => 
        contact._id === contactId 
          ? { ...contact, isRead: true }
          : contact
      ));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to mark message as read');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'unread') return !contact.isRead;
    if (filter === 'read') return contact.isRead;
    return true;
  });

  const unreadCount = contacts.filter(contact => !contact.isRead).length;

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
          <h1 className="text-3xl font-bold text-secondary-900">
            Contact Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 text-xs">({unreadCount})</span>
                )}
                {filterType === 'read' && (
                  <span className="ml-1 text-xs">({contacts.filter(c => c.isRead).length})</span>
                )}
                {filterType === 'all' && (
                  <span className="ml-1 text-xs">({contacts.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
              {filter === 'all' ? 'No contact messages yet' : `No ${filter} messages`}
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`p-6 hover:bg-secondary-50 cursor-pointer transition-colors ${
                    !contact.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {contact.name}
                        </h3>
                        {!contact.isRead && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-secondary-600 mb-2">{contact.email}</p>
                      <p className="text-secondary-700 line-clamp-2">
                        {contact.message}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-secondary-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {new Date(contact.createdAt).toLocaleTimeString()}
                      </p>
                      {!contact.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(contact._id);
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                      Message from {selectedContact.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <span>{selectedContact.email}</span>
                      <span>•</span>
                      <span>{new Date(selectedContact.createdAt).toLocaleString()}</span>
                      {!selectedContact.isRead && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Unread
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-secondary-900 mb-2">Message:</h3>
                  <p className="text-secondary-700 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: Your inquiry&body=Hi ${selectedContact.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0A`}
                      className="btn-primary"
                    >
                      Reply via Email
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedContact.email);
                        toast.success('Email copied to clipboard');
                      }}
                      className="btn-secondary"
                    >
                      Copy Email
                    </button>
                  </div>
                  
                  {!selectedContact.isRead && (
                    <button
                      onClick={() => {
                        markAsRead(selectedContact._id);
                        setSelectedContact({ ...selectedContact, isRead: true });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">Total Messages</div>
            <div className="text-2xl font-bold text-secondary-900">{contacts.length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">Unread Messages</div>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-secondary-600">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {contacts.filter(contact => {
                const contactDate = new Date(contact.createdAt);
                const now = new Date();
                return contactDate.getMonth() === now.getMonth() && 
                       contactDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;