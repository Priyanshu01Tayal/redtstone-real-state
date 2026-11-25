import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Edit3, Trash2, Eye, Shield, AlertTriangle, ExternalLink } from 'lucide-react';

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties/owner/my-properties');
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove listing "${title}"?`)) {
      try {
        await api.delete(`/properties/owner/${id}`);
        setProperties((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filtered = properties.filter((p) => {
    if (filter === 'all') return true;
    return p.approvalStatus === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">My Properties</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and track your property listings and assigned brokers</p>
        </div>

        <Link
          to="/owner/properties/add"
          className="inline-flex items-center space-x-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold">
        {[
          { key: 'all', label: `All (${properties.length})` },
          { key: 'approved', label: `Published (${properties.filter((p) => p.approvalStatus === 'approved').length})` },
          { key: 'pending', label: `Pending Review (${properties.filter((p) => p.approvalStatus === 'pending').length})` },
          { key: 'rejected', label: `Changes Needed (${properties.filter((p) => p.approvalStatus === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === tab.key ? 'bg-[#C62828] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading your properties...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No properties found in this category.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((prop) => (
              <div key={prop._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition">
                <div className="flex items-start space-x-4">
                  <img
                    src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                    alt={prop.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                        prop.listingType === 'sale' ? 'bg-red-100 text-[#C62828]' : 'bg-gray-100 text-gray-800'
                      }`}>
                        FOR {prop.listingType}
                      </span>
                      <span className="text-xs text-gray-400 font-medium capitalize">{prop.propertyType?.replace('_', ' ')}</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#222222] mt-1">{prop.title}</h3>
                    <p className="text-xs text-gray-500">{prop.locality}, {prop.city} • ₹{prop.price?.toLocaleString('en-IN')}</p>

                    {/* Assigned Broker Notice */}
                    {prop.assignedBrokerId ? (
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg w-fit">
                        <Shield className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>Assigned In-House Broker: <strong>{prop.assignedBrokerId.name}</strong> ({prop.assignedBrokerId.phone})</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 mt-2 font-medium">
                        Admin will assign an in-house broker upon approval
                      </p>
                    )}

                    {/* Rejection Notice if rejected */}
                    {prop.approvalStatus === 'rejected' && prop.rejectionReason && (
                      <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Reason for feedback:</strong> {prop.rejectionReason}
                          <p className="text-[11px] mt-0.5">Edit this property to update details and re-submit for approval.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      prop.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.approvalStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {prop.approvalStatus}
                  </span>

                  <div className="flex items-center space-x-2">
                    {prop.approvalStatus === 'approved' && (
                      <Link
                        to={`/properties/${prop._id}`}
                        target="_blank"
                        className="p-2 text-gray-500 hover:text-[#C62828] hover:bg-red-50 rounded-lg transition"
                        title="View Public Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      to={`/owner/properties/${prop._id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Property"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(prop._id, prop.title)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProperties;
