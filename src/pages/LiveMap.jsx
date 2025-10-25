import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DisasterMap from '../components/DisasterMap';
import { disasterAPI } from '../services/api';
import { FiRefreshCw, FiCheck, FiAlertCircle, FiHome } from 'react-icons/fi';

const LiveMap = () => {
  const [disasters, setDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // null, 'success', 'error'
  const [syncMessage, setSyncMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch real disaster data from backend
      const disasterData = await disasterAPI.getDisastersForMap();
      
      // Transform backend data to match map component expectations
      const transformedData = disasterData.map(disaster => ({
        ...disaster,
        lat: parseFloat(disaster.latitude),
        lng: parseFloat(disaster.longitude),
        timestamp: new Date(disaster.occurred_at), // Map occurred_at to timestamp
      }));
      
      setDisasters(transformedData);
    } catch (err) {
      console.error('Failed to load disaster data:', err);
      setError('Failed to load disaster data from server');
      // Fallback to empty array instead of crashing
      setDisasters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setSyncMessage('');

    try {
      const response = await disasterAPI.syncDisasters('all');
      
      // Extract summary from backend response
      // Backend returns: { success, message, data: { summary: { total, new, updated } } }
      const summary = response.data?.summary || {};
      const newCount = summary.new || 0;
      const updatedCount = summary.updated || 0;
      const totalCount = summary.total || 0;
      
      setSyncStatus('success');
      
      // Show appropriate message based on results
      if (newCount > 0 || updatedCount > 0) {
        setSyncMessage(`Synced: ${newCount} new, ${updatedCount} updated`);
      } else if (totalCount > 0) {
        setSyncMessage(`Up to date (${totalCount} total)`);
      } else {
        setSyncMessage('No new disasters found');
      }
      
      // Refresh the map data
      setTimeout(async () => {
        await loadData();
      }, 500);

      // Clear status message after 5 seconds
      setTimeout(() => {
        setSyncStatus(null);
        setSyncMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to sync disaster data:', err);
      setSyncStatus('error');
      setSyncMessage('Failed to sync data');
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setSyncStatus(null);
        setSyncMessage('');
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-white">
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Live Disaster Map
              </h1>
              <p className="text-sm text-gray-600">
                Real-time monitoring of natural disasters worldwide
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Home Button */}
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 shadow-sm"
              >
                <FiHome />
                <span>Home</span>
              </Link>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
                  transition-all duration-200 shadow-sm
                  ${isSyncing 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : syncStatus === 'success'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : syncStatus === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                {isSyncing ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : syncStatus === 'success' ? (
                  <>
                    <FiCheck />
                    <span>{syncMessage}</span>
                  </>
                ) : syncStatus === 'error' ? (
                  <>
                    <FiAlertCircle />
                    <span>{syncMessage}</span>
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    <span>Sync Data</span>
                  </>
                )}
              </button>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {isLoading ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    <span>Loading...</span>
                  </>
                ) : error ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Connection Error</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Live ({disasters.length})</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DisasterMap disasters={disasters} isLoading={isLoading} />
    </div>
  );
};

export default LiveMap;
