import React, { useState } from 'react';
import '../styles/AdminPanel.css';
import '../styles/AdminMobile.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'RoomRento',
      siteDescription: 'Best platform for room and hotel bookings',
      adminEmail: 'admin@roomrento.com',
      supportEmail: 'support@roomrento.com',
      contactPhone: '+91-8929082629',
      timezone: 'Asia/Kolkata',
      language: 'en',
      currency: 'INR'
    },
    booking: {
      commissionRate: 10,
      maxAdvanceBookingDays: 365,
      minAdvanceBookingHours: 2,
      cancellationDeadlineHours: 24,
      autoConfirmBookings: true,
      requirePaymentUpfront: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminNotifications: true,
      userWelcomeEmail: true,
      bookingConfirmationEmail: true,
      paymentNotifications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      allowGoogleLogin: true,
      allowFacebookLogin: false
    },
    payment: {
      razorpayEnabled: true,
      razorpayKeyId: 'rzp_test_123456789',
      stripeEnabled: false,
      paytmEnabled: true,
      upiEnabled: true,
      codEnabled: false
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'bi-gear' },
    { id: 'booking', label: 'Booking', icon: 'bi-calendar-check' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { id: 'security', label: 'Security', icon: 'bi-shield-check' },
    { id: 'payment', label: 'Payment', icon: 'bi-credit-card' }
  ];

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">Configure your platform settings and preferences</p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`alert ${saveMessage.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
          {saveMessage}
          <button type="button" className="btn-close" onClick={() => setSaveMessage('')}></button>
        </div>
      )}

      <div className="admin-settings">
        <div className="row">
          {/* Settings Tabs */}
          <div className="col-md-3">
            <div className="admin-card">
              <div className="admin-card-body p-0">
                <div className="settings-tabs">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`bi ${tab.icon}`}></i>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="col-md-9">
            <div className="admin-card">
              <div className="admin-card-header">
                <h5 className="admin-card-title">
                  <i className={`bi ${tabs.find(t => t.id === activeTab)?.icon}`}></i>
                  {tabs.find(t => t.id === activeTab)?.label} Settings
                </h5>
              </div>
              <div className="admin-card-body">
                
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="settings-section">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Site Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settings.general.siteName}
                          onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Admin Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={settings.general.adminEmail}
                          onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Site Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={settings.general.siteDescription}
                          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Support Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={settings.general.supportEmail}
                          onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={settings.general.contactPhone}
                          onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Timezone</label>
                        <select
                          className="form-select"
                          value={settings.general.timezone}
                          onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Language</label>
                        <select
                          className="form-select"
                          value={settings.general.language}
                          onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Currency</label>
                        <select
                          className="form-select"
                          value={settings.general.currency}
                          onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Settings */}
                {activeTab === 'booking' && (
                  <div className="settings-section">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Commission Rate (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="50"
                          value={settings.booking.commissionRate}
                          onChange={(e) => handleInputChange('booking', 'commissionRate', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Max Advance Booking (Days)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max="730"
                          value={settings.booking.maxAdvanceBookingDays}
                          onChange={(e) => handleInputChange('booking', 'maxAdvanceBookingDays', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Min Advance Booking (Hours)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max="72"
                          value={settings.booking.minAdvanceBookingHours}
                          onChange={(e) => handleInputChange('booking', 'minAdvanceBookingHours', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Cancellation Deadline (Hours)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max="168"
                          value={settings.booking.cancellationDeadlineHours}
                          onChange={(e) => handleInputChange('booking', 'cancellationDeadlineHours', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.booking.autoConfirmBookings}
                            onChange={(e) => handleInputChange('booking', 'autoConfirmBookings', e.target.checked)}
                          />
                          <label className="form-check-label">Auto-confirm bookings</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.booking.requirePaymentUpfront}
                            onChange={(e) => handleInputChange('booking', 'requirePaymentUpfront', e.target.checked)}
                          />
                          <label className="form-check-label">Require payment upfront</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="settings-section">
                    <div className="row g-3">
                      <div className="col-12">
                        <h6 className="mb-3">Notification Channels</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Email Notifications</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.smsNotifications}
                            onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">SMS Notifications</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.pushNotifications}
                            onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Push Notifications</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.adminNotifications}
                            onChange={(e) => handleInputChange('notifications', 'adminNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Admin Notifications</label>
                        </div>
                      </div>
                      
                      <div className="col-12 mt-4">
                        <h6 className="mb-3">Email Templates</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.userWelcomeEmail}
                            onChange={(e) => handleInputChange('notifications', 'userWelcomeEmail', e.target.checked)}
                          />
                          <label className="form-check-label">User Welcome Email</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.bookingConfirmationEmail}
                            onChange={(e) => handleInputChange('notifications', 'bookingConfirmationEmail', e.target.checked)}
                          />
                          <label className="form-check-label">Booking Confirmation Email</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.paymentNotifications}
                            onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Payment Notifications</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="settings-section">
                    <div className="row g-3">
                      <div className="col-12">
                        <h6 className="mb-3">Authentication & Security</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                          />
                          <label className="form-check-label">Two-Factor Authentication</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="5"
                          max="480"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Max Login Attempts</label>
                        <input
                          type="number"
                          className="form-control"
                          min="3"
                          max="10"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Min Password Length</label>
                        <input
                          type="number"
                          className="form-control"
                          min="6"
                          max="32"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="col-12 mt-4">
                        <h6 className="mb-3">Login Options</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.security.requireStrongPassword}
                            onChange={(e) => handleInputChange('security', 'requireStrongPassword', e.target.checked)}
                          />
                          <label className="form-check-label">Require Strong Password</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.security.allowGoogleLogin}
                            onChange={(e) => handleInputChange('security', 'allowGoogleLogin', e.target.checked)}
                          />
                          <label className="form-check-label">Allow Google Login</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.security.allowFacebookLogin}
                            onChange={(e) => handleInputChange('security', 'allowFacebookLogin', e.target.checked)}
                          />
                          <label className="form-check-label">Allow Facebook Login</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Settings */}
                {activeTab === 'payment' && (
                  <div className="settings-section">
                    <div className="row g-3">
                      <div className="col-12">
                        <h6 className="mb-3">Payment Gateways</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.razorpayEnabled}
                            onChange={(e) => handleInputChange('payment', 'razorpayEnabled', e.target.checked)}
                          />
                          <label className="form-check-label">Razorpay</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Razorpay Key ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settings.payment.razorpayKeyId}
                          onChange={(e) => handleInputChange('payment', 'razorpayKeyId', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.stripeEnabled}
                            onChange={(e) => handleInputChange('payment', 'stripeEnabled', e.target.checked)}
                          />
                          <label className="form-check-label">Stripe</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.paytmEnabled}
                            onChange={(e) => handleInputChange('payment', 'paytmEnabled', e.target.checked)}
                          />
                          <label className="form-check-label">Paytm</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.upiEnabled}
                            onChange={(e) => handleInputChange('payment', 'upiEnabled', e.target.checked)}
                          />
                          <label className="form-check-label">UPI Payments</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.codEnabled}
                            onChange={(e) => handleInputChange('payment', 'codEnabled', e.target.checked)}
                          />
                          <label className="form-check-label">Cash on Delivery</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-4 pt-3 border-top">
                  <button 
                    className="btn btn-primary px-4"
                    onClick={handleSaveSettings}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
