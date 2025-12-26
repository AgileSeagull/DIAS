import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiGlobe, FiCheck, FiAlertCircle, FiLoader, FiMapPin, FiUsers, FiBell, FiX } from 'react-icons/fi';
import apiClient from '../services/api';

const Subscribe = () => {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [stats, setStats] = useState(null);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load subscriptions for authenticated user
  const loadMySubscriptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/subscribe/my-subscriptions', {
        params: { email: user?.email }
      });
      setMySubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      setMySubscriptions([]);
    }
  }, [user?.email]);

  // Load countries and stats on mount
  useEffect(() => {
    loadCountries();
    loadStats();
    loadMySubscriptions();
  }, [loadMySubscriptions]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await apiClient.get('/api/subscribe/countries');
      setCountries(response.data.data || []);
    } catch (error) {
      console.error('Failed to load countries:', error);
      setMessage({ type: 'error', text: 'Failed to load available countries' });
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/subscribe/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUnsubscribe = async (id, country) => {
    if (!window.confirm(`Are you sure you want to unsubscribe from ${country} alerts?`)) {
      return;
    }

    try {
      const params = { email: user?.email };
      
      if (!params.email) {
        setMessage({
          type: 'error',
          text: 'Email is required. Please enter your email first.'
        });
        return;
      }
      
      await apiClient.delete(`/api/subscribe/${id}`, {
        params
      });

      setMessage({
        type: 'success', 
        text: `Unsubscribed from ${country} alerts. You won't receive any more notifications for this country.`
      });

      // Reload subscriptions
      setTimeout(() => {
        loadMySubscriptions();
      }, 1000);

    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to unsubscribe. Please try again.' 
      });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedCountry) {
      setMessage({ type: 'error', text: 'Please select a country' });
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/subscribe', {
        email: user?.email,
        country: selectedCountry,
      });

      setMessage({
        type: 'success',
        text: 'Subscription request sent! Please check your email (including spam folder) to confirm your subscription.',
      });

      setSelectedCountry('');
      setTimeout(() => {
        loadMySubscriptions();
        loadStats();
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <FiBell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Subscribe to Disaster Alerts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Receive real-time email notifications when disasters occur in your selected countries
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Total Available Countries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiGlobe className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {countries.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Available Countries</div>
              </div>
            </div>
          </div>

          {/* My Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <FiBell className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {mySubscriptions.filter(s => s.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">My Active Subscriptions</div>
              </div>
            </div>
          </div>
        </div>

        {/* My Subscriptions Section */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Subscriptions
          </h2>

            {mySubscriptions.filter(sub => sub.status !== 'unsubscribed').length === 0 ? (
              <p className="text-gray-600">
                You haven't subscribed to any countries yet. Use the form below to subscribe!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySubscriptions
                  .filter(sub => sub.status !== 'unsubscribed')
                  .map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-base font-medium text-gray-900 mb-1">
                        {sub.country}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sub.status === 'confirmed' ? (
                          <span className="text-green-600 flex items-center space-x-1">
                            <FiCheck className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        ) : sub.status === 'unsubscribed' ? (
                          <span className="text-red-600">Unsubscribed</span>
                        ) : (
                          <span className="text-amber-600">Pending confirmation</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {sub.subscribed_at && new Date(sub.subscribed_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsubscribe(sub.id, sub.country)}
                      className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="Unsubscribe"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Subscribe to Country Alerts
              </h2>

              <form onSubmit={handleSubscribe} className="space-y-6">
                {/* Email Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Subscriptions will be sent to your account email</p>
                </div>

                {/* Country Selection */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="country"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      required
                      disabled={loadingCountries}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">
                        {loadingCountries ? 'Loading countries...' : 'Choose a country'}
                      </option>
                      {countries.map((country) => (
                        <option key={country.country} value={country.country}>
                          {country.country} ({country.disaster_count} active disasters)
                        </option>
                      ))}
                    </select>
                  </div>
                  {countries.length === 0 && !loadingCountries && (
                    <p className="mt-2 text-sm text-amber-600">
                      No countries available yet. The system will populate them when disasters are detected.
                    </p>
                  )}
                </div>

                {/* Message Display */}
                {message.text && (
                  <div
                    className={`flex items-start space-x-3 p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        message.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || loadingCountries || countries.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                    loading || loadingCountries || countries.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <FiLoader className="animate-spin" />
                      <span>Subscribing...</span>
                    </span>
                  ) : (
                    'Subscribe to Alerts'
                  )}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  How it works:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive a confirmation email from AWS</li>
                  <li>• Click the confirmation link to activate</li>
                  <li>• Get instant alerts when disasters occur</li>
                  <li>• Subscribe to multiple countries if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Countries */}
            {stats?.top_countries && stats.top_countries.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Most Subscribed
                </h3>

                <div className="space-y-3">
                  {stats.top_countries.slice(0, 5).map((country) => (
                    <div
                      key={country.country}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm text-gray-900">{country.country}</div>
                      <div className="text-xs text-gray-500">
                        {country.subscriber_count} subscribers
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Why Subscribe?</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Real-time disaster alerts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Country-specific notifications</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Detailed disaster information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Free service, no spam</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
