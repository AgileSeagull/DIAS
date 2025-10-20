import { useState, useEffect } from 'react';
import { disasterAPI } from '../services/api';

/**
 * Custom hook for fetching disaster data
 * Will be fully implemented in Phase 2
 */
export const useDisasters = (type = 'all') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let results = [];

        if (type === 'all' || type === 'earthquake') {
          // TODO: Implement actual API call
          // const earthquakes = await disasterAPI.getEarthquakes();
          // results = [...results, ...earthquakes];
        }
        if (type === 'all' || type === 'flood') {
          // TODO: Implement actual API call
          // const floods = await disasterAPI.getFloods();
          // results = [...results, ...floods];
        }
        if (type === 'all' || type === 'fire') {
          // TODO: Implement actual API call
          // const wildfires = await disasterAPI.getWildfires();
          // results = [...results, ...wildfires];
        }
        if (type === 'all' || type === 'cyclone') {
          // TODO: Implement actual API call
          // const cyclones = await disasterAPI.getCyclones();
          // results = [...results, ...cyclones];
        }

        setData(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return { data, loading, error };
};

