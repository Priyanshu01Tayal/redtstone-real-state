import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import { Heart } from 'lucide-react';

const ClientFavorites = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show featured properties as recommendations for saved favorites
    const fetchFavs = async () => {
      try {
        const res = await api.get('/properties/featured');
        setProperties(res.data.properties || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Saved Properties</h1>
        <p className="text-xs text-gray-500 mt-1">Properties you have shortlisted for upcoming decisions.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading shortlisted properties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientFavorites;
