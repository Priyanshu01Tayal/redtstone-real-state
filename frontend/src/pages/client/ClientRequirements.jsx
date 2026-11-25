import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';

const ClientRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [newReq, setNewReq] = useState({
    purpose: 'sale',
    category: 'residential',
    city: 'Ghaziabad',
    preferredLocalities: ['Crossing Republik'],
    budgetMin: 6000000,
    budgetMax: 9500000,
    bhk: [3],
    furnishingPreference: 'any',
    contactPreference: 'phone',
    additionalNotes: 'Need a park-facing apartment with 1 covered parking spot.',
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/client/requirements');
      const list = res.data.requirements || [];
      setRequirements(list);
      if (list.length > 0) {
        handleSelectRequirement(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequirement = async (req) => {
    setSelectedReq(req);
    setMatchingLoading(true);
    try {
      const res = await api.get(`/client/requirements/${req._id}/matches`);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        purpose: newReq.purpose,
        category: newReq.category,
        city: newReq.city,
        preferredLocalities: newReq.preferredLocalities,
        budget: { min: Number(newReq.budgetMin), max: Number(newReq.budgetMax) },
        bhk: newReq.bhk,
        furnishingPreference: newReq.furnishingPreference,
        contactPreference: newReq.contactPreference,
        additionalNotes: newReq.additionalNotes,
      };

      const res = await api.post('/client/requirements', payload);
      alert('Requirement submitted! Our matching engine found initial matches.');
      setShowForm(false);
      fetchRequirements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit requirement');
    }
  };

  const handleDeleteRequirement = async (id) => {
    if (!confirm('Are you sure you want to remove this property search requirement?')) return;
    try {
      await api.delete(`/client/requirements/${id}`);
      fetchRequirements();
    } catch (err) {
      alert('Failed to delete requirement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFCDD2] text-[#C62828] mb-1">
            Personalized Buyer Concierge
          </span>
          <h1 className="text-2xl font-black text-[#222222]">My Property Requirements & Match Engine</h1>
          <p className="text-xs text-[#777777]">
            Submit your specific home criteria. Our automated scoring algorithm continuously pairs you with verified listings.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#C62828] text-white font-bold rounded-xl hover:bg-[#B71C1C] transition-colors shadow-md text-xs shrink-0"
        >
          {showForm ? 'Cancel Form' : '+ New Requirement'}
        </button>
      </div>

      {/* New Requirement Form Drawer */}
      {showForm && (
        <form
          onSubmit={handleCreateRequirement}
          className="bg-white p-6 rounded-2xl border border-[#C62828] shadow-md space-y-4"
        >
          <h3 className="font-bold text-base text-[#222222]">Define Your Target Property Criteria</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Purpose</label>
              <select
                value={newReq.purpose}
                onChange={(e) => setNewReq({ ...newReq, purpose: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              >
                <option value="sale">Buy Property</option>
                <option value="rent">Rent / Lease</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <select
                value={newReq.category}
                onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={newReq.city}
                onChange={(e) => setNewReq({ ...newReq, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Locality</label>
              <select
                value={newReq.preferredLocalities[0]}
                onChange={(e) => setNewReq({ ...newReq, preferredLocalities: [e.target.value] })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              >
                <option value="Crossing Republik">Crossing Republik</option>
                <option value="Indirapuram">Indirapuram</option>
                <option value="Raj Nagar Extension">Raj Nagar Extension</option>
                <option value="Sector 62">Sector 62, Noida</option>
                <option value="Golf Course Road">Golf Course Road, Gurgaon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Max Budget (₹)</label>
              <input
                type="number"
                value={newReq.budgetMax}
                onChange={(e) => setNewReq({ ...newReq, budgetMax: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#C62828]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preferred BHK</label>
              <select
                value={newReq.bhk[0]}
                onChange={(e) => setNewReq({ ...newReq, bhk: [Number(e.target.value)] })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing</label>
              <select
                value={newReq.furnishingPreference}
                onChange={(e) => setNewReq({ ...newReq, furnishingPreference: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              >
                <option value="any">Any Furnishing</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully-Furnished</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
            <input
              type="text"
              placeholder="e.g. Park facing unit, high floor, immediate possession..."
              value={newReq.additionalNotes}
              onChange={(e) => setNewReq({ ...newReq, additionalNotes: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#C62828] text-white text-xs font-bold rounded-xl hover:bg-[#B71C1C]"
            >
              Save & Run Matches
            </button>
          </div>
        </form>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols) - List of Saved Requirements */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            <span>Active Searches ({requirements.length})</span>
          </div>

          {loading ? (
            <div className="p-8 bg-white rounded-2xl text-center text-xs text-gray-400 border border-[#EEEEEE]">
              Loading requirements...
            </div>
          ) : requirements.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl text-center border border-[#EEEEEE]">
              <p className="text-xs text-gray-500">No active requirements set up yet.</p>
            </div>
          ) : (
            requirements.map((req) => {
              const isSelected = selectedReq?._id === req._id;
              return (
                <div
                  key={req._id}
                  onClick={() => handleSelectRequirement(req)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#C62828] bg-red-50/30 shadow-md'
                      : 'border-[#EEEEEE] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
                      {req.purpose} • {req.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequirement(req._id);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="font-bold text-sm text-[#222222] mt-1">
                    {Array.isArray(req.preferredLocalities) ? req.preferredLocalities.join(', ') : req.preferredLocalities || req.city}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Budget up to: <b className="text-[#C62828]">₹{(req.budget?.max / 100000).toFixed(2)} L</b>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                    <span>{req.bhk?.length ? `${req.bhk.join('/')} BHK` : 'Any BHK'}</span>
                    <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> View Matches →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (8 cols) - Match Results */}
        <div className="lg:col-span-8 space-y-4">
          {selectedReq ? (
            <div>
              <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm mb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[#222222]">
                    Matched Properties for: <span className="text-[#C62828]">{Array.isArray(selectedReq.preferredLocalities) ? selectedReq.preferredLocalities.join(', ') : selectedReq.preferredLocalities || selectedReq.city}</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Ranked by weighted score (Location 30%, Budget 25%, Property Type 20%, Area 10%, Specs 10%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#2E7D32] bg-emerald-50 px-2.5 py-1 rounded-full">
                    {matches.length} Matches Found
                  </span>
                </div>
              </div>

              {matchingLoading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C62828] border-r-transparent"></div>
                  <p className="text-xs text-gray-500 mt-2">Computing match scores...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
                  <p className="text-sm font-semibold text-gray-500">
                    No active properties match your strict criteria right now.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Our brokers are notified of your requirement and will contact you when a match is listed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((item) => (
                    <div
                      key={item.property._id}
                      className="bg-white rounded-2xl border border-[#EEEEEE] p-4 shadow-sm space-y-3"
                    >
                      {/* Match Score Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-lg shadow-sm">
                            {item.matchScore}% Match
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.matchReasons?.map((reason, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                              >
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Property Card embedding */}
                      <PropertyCard property={item.property} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#EEEEEE]">
              <p className="text-sm text-gray-500">Select or create a requirement to view matched properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRequirements;
