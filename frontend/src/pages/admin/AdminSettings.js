import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    retainerAmount: 50,
    paymentInstructions: {
      cashApp: '',
      paypal: '',
      bankTransfer: {
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: ''
      }
    },
    businessInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    emailConfig: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPass: '',
      fromEmail: '',
      fromName: 'ServicePro',
      enabled: false
    },
    emailTemplates: {
      bookingConfirmation: {
        subject: 'Booking Confirmation - {{bookingId}}',
        enabled: true
      },
      paymentConfirmation: {
        subject: 'Payment Confirmed - {{bookingId}}',
        enabled: true
      },
      bookingReminder: {
        subject: 'Upcoming Appointment Reminder - {{serviceName}}',
        enabled: true
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('https://selfservice-q5fd.onrender.com/api/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, section = null, subsection = null, subsubsection = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    
    if (section && subsection && subsubsection) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [subsection]: {
            ...settings[section][subsection],
            [subsubsection]: {
              ...settings[section][subsection][subsubsection],
              [name]: inputValue
            }
          }
        }
      });
    } else if (section && subsection) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [subsection]: {
            ...settings[section][subsection],
            [name]: inputValue
          }
        }
      });
    } else if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [name]: inputValue
        }
      });
    } else {
      setSettings({
        ...settings,
        [name]: inputValue
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('https://selfservice-q5fd.onrender.com/api/admin/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
    setTestingEmail(true);
    try {
      const response = await axios.post('https://selfservice-q5fd.onrender.com/api/admin/test-email');
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to test email configuration');
    } finally {
      setTestingEmail(false);
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="name"
                  value={settings.businessInfo.name}
                  onChange={(e) => handleInputChange(e, 'businessInfo')}
                  className="input-field"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label htmlFor="businessEmail" className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  id="businessEmail"
                  name="email"
                  value={settings.businessInfo.email}
                  onChange={(e) => handleInputChange(e, 'businessInfo')}
                  className="input-field"
                  placeholder="contact@yourbusiness.com"
                />
              </div>

              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Phone
                </label>
                <input
                  type="tel"
                  id="businessPhone"
                  name="phone"
                  value={settings.businessInfo.phone}
                  onChange={(e) => handleInputChange(e, 'businessInfo')}
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  name="address"
                  value={settings.businessInfo.address}
                  onChange={(e) => handleInputChange(e, 'businessInfo')}
                  className="input-field"
                  placeholder="123 Business St, City, State 12345"
                />
              </div>
            </div>
          </div>

          {/* Retainer Amount */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Booking Settings</h2>
            <div className="max-w-md">
              <label htmlFor="retainerAmount" className="block text-sm font-medium text-secondary-700 mb-2">
                Retainer Amount ($)
              </label>
              <input
                type="number"
                id="retainerAmount"
                name="retainerAmount"
                value={settings.retainerAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="input-field"
                placeholder="50.00"
              />
              <p className="text-sm text-secondary-500 mt-1">
                Amount customers need to pay to secure their booking
              </p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Payment Instructions</h2>
            
            {/* CashApp */}
            <div className="mb-6">
              <label htmlFor="cashApp" className="block text-sm font-medium text-secondary-700 mb-2">
                CashApp Handle
              </label>
              <input
                type="text"
                id="cashApp"
                name="cashApp"
                value={settings.paymentInstructions.cashApp}
                onChange={(e) => handleInputChange(e, 'paymentInstructions')}
                className="input-field max-w-md"
                placeholder="$YourCashAppHandle"
              />
            </div>

            {/* PayPal */}
            <div className="mb-6">
              <label htmlFor="paypal" className="block text-sm font-medium text-secondary-700 mb-2">
                PayPal Email
              </label>
              <input
                type="email"
                id="paypal"
                name="paypal"
                value={settings.paymentInstructions.paypal}
                onChange={(e) => handleInputChange(e, 'paymentInstructions')}
                className="input-field max-w-md"
                placeholder="your-paypal@email.com"
              />
            </div>

            {/* Bank Transfer */}
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Bank Transfer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={settings.paymentInstructions.bankTransfer.accountName}
                    onChange={(e) => handleInputChange(e, 'paymentInstructions', 'bankTransfer')}
                    className="input-field"
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={settings.paymentInstructions.bankTransfer.accountNumber}
                    onChange={(e) => handleInputChange(e, 'paymentInstructions', 'bankTransfer')}
                    className="input-field"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="routingNumber" className="block text-sm font-medium text-secondary-700 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    value={settings.paymentInstructions.bankTransfer.routingNumber}
                    onChange={(e) => handleInputChange(e, 'paymentInstructions', 'bankTransfer')}
                    className="input-field"
                    placeholder="123456789"
                  />
                </div>

                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-secondary-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={settings.paymentInstructions.bankTransfer.bankName}
                    onChange={(e) => handleInputChange(e, 'paymentInstructions', 'bankTransfer')}
                    className="input-field"
                    placeholder="Your Bank Name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Email Configuration</h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={settings.emailConfig.enabled}
                    onChange={(e) => handleInputChange(e, 'emailConfig')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-700">Enable Email Service</span>
                </label>
                <button
                  type="button"
                  onClick={testEmailConfiguration}
                  disabled={testingEmail || !settings.emailConfig.enabled}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingEmail ? 'Testing...' : 'Test Email'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={settings.emailConfig.smtpHost}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  name="smtpPort"
                  value={settings.emailConfig.smtpPort}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="587"
                />
              </div>

              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Username (Email)
                </label>
                <input
                  type="email"
                  id="smtpUser"
                  name="smtpUser"
                  value={settings.emailConfig.smtpUser}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPass" className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Password (App Password)
                </label>
                <input
                  type="password"
                  id="smtpPass"
                  name="smtpPass"
                  value={settings.emailConfig.smtpPass}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="Your app password"
                />
              </div>

              <div>
                <label htmlFor="fromEmail" className="block text-sm font-medium text-secondary-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value={settings.emailConfig.fromEmail}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="noreply@yourbusiness.com"
                />
              </div>

              <div>
                <label htmlFor="fromName" className="block text-sm font-medium text-secondary-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value={settings.emailConfig.fromName}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="input-field"
                  placeholder="ServicePro"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smtpSecure"
                  checked={settings.emailConfig.smtpSecure}
                  onChange={(e) => handleInputChange(e, 'emailConfig')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <span className="ml-2 text-sm text-secondary-700">Use SSL/TLS (Port 465)</span>
              </label>
              <p className="text-xs text-secondary-500 mt-1">
                Leave unchecked for STARTTLS (Port 587) - recommended for Gmail
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Gmail Setup Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Enable 2-Factor Authentication on your Gmail account</li>
                <li>2. Generate an App Password: Google Account → Security → App passwords</li>
                <li>3. Use your Gmail address as SMTP Username</li>
                <li>4. Use the generated App Password (not your regular password)</li>
                <li>5. Keep SMTP Host as smtp.gmail.com and Port as 587</li>
              </ol>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Email Templates</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="bookingConfirmationSubject" className="block text-sm font-medium text-secondary-700">
                    Booking Confirmation Email Subject
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={settings.emailTemplates.bookingConfirmation.enabled}
                      onChange={(e) => handleInputChange(e, 'emailTemplates', 'bookingConfirmation')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enabled</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="bookingConfirmationSubject"
                  name="subject"
                  value={settings.emailTemplates.bookingConfirmation.subject}
                  onChange={(e) => handleInputChange(e, 'emailTemplates', 'bookingConfirmation')}
                  className="input-field"
                  placeholder="Booking Confirmation - {{bookingId}}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="paymentConfirmationSubject" className="block text-sm font-medium text-secondary-700">
                    Payment Confirmation Email Subject
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={settings.emailTemplates.paymentConfirmation.enabled}
                      onChange={(e) => handleInputChange(e, 'emailTemplates', 'paymentConfirmation')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enabled</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="paymentConfirmationSubject"
                  name="subject"
                  value={settings.emailTemplates.paymentConfirmation.subject}
                  onChange={(e) => handleInputChange(e, 'emailTemplates', 'paymentConfirmation')}
                  className="input-field"
                  placeholder="Payment Confirmed - {{bookingId}}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="bookingReminderSubject" className="block text-sm font-medium text-secondary-700">
                    Booking Reminder Email Subject
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={settings.emailTemplates.bookingReminder.enabled}
                      onChange={(e) => handleInputChange(e, 'emailTemplates', 'bookingReminder')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enabled</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="bookingReminderSubject"
                  name="subject"
                  value={settings.emailTemplates.bookingReminder.subject}
                  onChange={(e) => handleInputChange(e, 'emailTemplates', 'bookingReminder')}
                  className="input-field"
                  placeholder="Upcoming Appointment Reminder - {{serviceName}}"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Available Variables:</h4>
              <p className="text-sm text-yellow-800">
                <strong>Booking emails:</strong> {`{{customerName}}, {{bookingId}}, {{serviceName}}, {{bookingDate}}, {{bookingTime}}, {{retainerAmount}}, {{businessName}}`}
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>Reminder emails:</strong> {`{{customerName}}, {{serviceName}}, {{bookingDate}}, {{bookingTime}}, {{businessName}}, {{businessAddress}}`}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;