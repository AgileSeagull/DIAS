import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiBell, 
  FiMap,
  FiAlertCircle,
  FiMapPin,
  FiClock,
  FiGlobe,
  FiUsers
} from 'react-icons/fi';
import { disasterAPI } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState([
    { 
      type: 'alert', 
      icon: '🔔',
      number: '0',
      label: 'Active Alerts',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-500'
    },
    { 
      type: 'regions', 
      icon: '🌍',
      number: '50+',
      label: 'Monitored Regions',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500'
    },
    { 
      type: 'subscribers', 
      icon: '👥',
      number: '1.2K+',
      label: 'Alert Subscribers',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500'
    },
    { 
      type: 'response', 
      icon: '⚡',
      number: '< 1 min',
      label: 'Response Time',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-500'
    },
  ]);

  // Fetch real statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const disasterData = await disasterAPI.getDisastersForMap();
        
        // Calculate stats
        const earthquakeCount = disasterData.filter(d => d.type === 'earthquake').length;
        const criticalCount = disasterData.filter(d => d.severity === 'critical').length;
        
        // Update stats with real data
        setStats(prev => [
          { ...prev[0], number: criticalCount.toString() },
          { ...prev[1], number: earthquakeCount > 0 ? earthquakeCount.toString() : '50+' },
          prev[2], // Keep subscribers estimate
          prev[3], // Keep response time
        ]);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Keep default stats on error
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Stay Safe, Stay Informed
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Real-time disaster alerts and information to protect you and your loved ones. Get instant notifications about natural disasters, severe weather, and emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              View Live Map
            </Link>
            <Link
              to="/subscribe"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Get Alerts
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FiMapPin,
                title: 'Location-Based Alerts',
                description: 'Receive alerts specific to your location. Know when disasters affect your area.',
                iconColor: 'text-red-600',
                bgColor: 'bg-red-50'
              },
              {
                icon: FiBell,
                title: 'Real-Time Updates',
                description: 'Get instant notifications via SMS, email, and push notifications.',
                iconColor: 'text-yellow-600',
                bgColor: 'bg-yellow-50'
              },
              {
                icon: FiMap,
                title: 'Interactive Maps',
                description: 'Visualize disaster hotspots and affected regions on an interactive map.',
                iconColor: 'text-blue-600',
                bgColor: 'bg-blue-50'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`inline-flex p-4 rounded-full ${feature.bgColor} mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Status Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-4`}>
                  <span className="text-4xl">{stat.icon}</span>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {stat.number}
                </div>
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Stay Protected?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe now to receive instant disaster alerts and keep yourself and your family safe.
          </p>
          <Link
            to="/subscribe"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Subscribe for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
