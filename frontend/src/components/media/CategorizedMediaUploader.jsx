import React, { useState } from 'react';
import api from '../../services/api';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Compass,
  Trash2,
  CheckCircle,
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Film,
  Eye,
} from 'lucide-react';

const MEDIA_CATEGORIES = [
  { id: 'exterior', label: '1. Exterior Architecture', icon: '🏛️', desc: 'Building facade, entrance gate, elevation' },
  { id: 'livingRoom', label: '2. Living Room', icon: '🛋️', desc: 'Main hall, dining space, foyer' },
  { id: 'bedrooms', label: '3. Bedrooms', icon: '🛏️', desc: 'Master bedroom, guest rooms, wardrobes' },
  { id: 'kitchen', label: '4. Kitchen', icon: '🍳', desc: 'Modular counter, cabinetry, utility area' },
  { id: 'bathrooms', label: '5. Bathrooms', icon: '🚿', desc: 'Fittings, sanitary ware, master bath' },
  { id: 'balcony', label: '6. Balcony & Views', icon: '🌿', desc: 'Balcony views, sit-out terrace' },
  { id: 'other', label: '7. Other Spaces', icon: '📦', desc: 'Parking, study room, lobby, corridor' },
  { id: 'panoramas', label: '8. 360° Panoramic Images', icon: '🌐', desc: 'Equirectangular spherical room panoramas' },
  { id: 'walkthroughVideos', label: '9. Walkthrough Video', icon: '🎥', desc: 'Full property walkthrough video (MP4/WebM)' },
];

const CategorizedMediaUploader = ({ media, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('livingRoom');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Handle local file uploads through backend /api/properties/upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg('');
    setUploading(true);
    setUploadProgress(10);

    // Validate size and format
    const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideo = ['video/mp4', 'video/webm'];

    for (const file of files) {
      if (selectedCategory === 'walkthroughVideos') {
        if (!allowedVideo.includes(file.type)) {
          setErrorMsg('Only MP4 and WebM video formats are supported');
          setUploading(false);
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          setErrorMsg('Video file size exceeds 50MB limit');
          setUploading(false);
          return;
        }
      } else {
        if (!allowedImage.includes(file.type)) {
          setErrorMsg('Only JPG, PNG, and WebP images are supported');
          setUploading(false);
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          setErrorMsg('Image file size exceeds 20MB limit');
          setUploading(false);
          return;
        }
      }
    }

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      setUploadProgress(40);
      const res = await api.post('/properties/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(95, percent));
        },
      });

      setUploadProgress(100);

      const uploaded = res.data?.files || [];
      if (uploaded.length > 0) {
        if (selectedCategory === 'walkthroughVideos') {
          const newVideos = uploaded.map((f) => ({
            url: f.url,
            title: f.originalName || 'Walkthrough Video',
            duration: 0,
          }));
          onChange({
            ...media,
            walkthroughVideos: [...(media.walkthroughVideos || []), ...newVideos],
          });
        } else if (selectedCategory === 'panoramas') {
          const newPanos = uploaded.map((f) => ({
            url: f.url,
            roomName: 'Living Room',
            caption: '360° Spherical Panorama',
          }));
          onChange({
            ...media,
            panoramas: [...(media.panoramas || []), ...newPanos],
          });
        } else {
          const newImages = uploaded.map((f, idx) => ({
            url: f.url,
            caption: `${selectedCategory} photo`,
            isFeatured: false,
            sortOrder: (media[selectedCategory]?.length || 0) + idx,
          }));
          onChange({
            ...media,
            [selectedCategory]: [...(media[selectedCategory] || []), ...newImages],
          });
        }
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      e.target.value = null; // reset input
    }
  };

  // Add Video URL manually
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    onChange({
      ...media,
      walkthroughVideos: [
        ...(media.walkthroughVideos || []),
        { url: videoUrlInput.trim(), title: 'Property Walkthrough Video', duration: 0 },
      ],
    });
    setVideoUrlInput('');
  };

  // Delete media item
  const handleDeleteItem = (category, index) => {
    const list = [...(media[category] || [])];
    list.splice(index, 1);
    onChange({
      ...media,
      [category]: list,
    });
  };

  // Move item (reorder)
  const handleReorder = (category, index, direction) => {
    const list = [...(media[category] || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    onChange({
      ...media,
      [category]: list,
    });
  };

  // Toggle Featured image
  const handleSetFeatured = (category, index) => {
    const updated = { ...media };
    Object.keys(updated).forEach((cat) => {
      if (Array.isArray(updated[cat])) {
        updated[cat] = updated[cat].map((item) => ({ ...item, isFeatured: false }));
      }
    });
    if (updated[category]?.[index]) {
      updated[category][index].isFeatured = true;
    }
    onChange(updated);
  };

  // Calculate total counts
  const totalPhotosCount = Object.keys(media || {}).reduce((acc, cat) => {
    if (cat !== 'walkthroughVideos') return acc + (media[cat]?.length || 0);
    return acc;
  }, 0);

  const currentCategoryItems = media[selectedCategory] || [];

  return (
    <div className="space-y-6">
      {/* Category Selection Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#222222] uppercase tracking-wider">
            Select Room / Media Category
          </label>
          <span className="text-xs font-semibold text-[#C62828]">
            {totalPhotosCount} Photos • {media.walkthroughVideos?.length || 0} Videos Uploaded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {MEDIA_CATEGORIES.map((cat) => {
            const count = media[cat.id]?.length || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#C62828] text-white border-[#C62828] shadow-md'
                    : 'bg-white hover:bg-gray-50 border-[#EEEEEE] text-[#222222]'
                }`}
              >
                <div className="flex items-center justify-between text-base mb-1">
                  <span>{cat.icon}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <span className="text-xs font-bold truncate block">{cat.label.replace(/^\d+\.\s*/, '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Zone for Active Category */}
      <div className="bg-[#F8F8F8] p-6 rounded-3xl border-2 border-dashed border-gray-300 hover:border-[#C62828] transition text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C62828] flex items-center justify-center mx-auto shadow-sm">
          {selectedCategory === 'walkthroughVideos' ? (
            <Video className="w-6 h-6" />
          ) : selectedCategory === 'panoramas' ? (
            <Compass className="w-6 h-6" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#222222]">
            Upload to {MEDIA_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedCategory === 'walkthroughVideos'
              ? 'Upload MP4/WebM walkthrough video (up to 50MB)'
              : selectedCategory === 'panoramas'
              ? 'Upload 360° spherical panoramic photos (equirectangular projection)'
              : 'JPG, PNG, or WebP high-resolution photos (up to 20MB per photo)'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="max-w-md mx-auto space-y-1">
            <div className="flex justify-between text-xs font-bold text-gray-600">
              <span>Uploading securely...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C62828] h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <label className="cursor-pointer px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Select Local Files to Upload</span>
            <input
              type="file"
              multiple={selectedCategory !== 'walkthroughVideos'}
              accept={selectedCategory === 'walkthroughVideos' ? 'video/mp4,video/webm' : 'image/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {selectedCategory === 'walkthroughVideos' && (
            <div className="flex items-center gap-2 w-full max-w-md mt-2">
              <input
                type="text"
                placeholder="Or paste video link (https://...)"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
              />
              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold"
              >
                Add Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Category Items Grid with Reordering & Previews */}
      {currentCategoryItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
            <span>Uploaded in this Category ({currentCategoryItems.length})</span>
            <span>Drag, reorder, or set primary cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCategoryItems.map((item, idx) => (
              <div
                key={idx}
                className="relative group bg-white rounded-2xl overflow-hidden border border-[#EEEEEE] shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Media Preview (Video or Image) */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {selectedCategory === 'walkthroughVideos' ? (
                    <video controls className="w-full h-full object-cover">
                      <source src={item.url} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}

                  {/* Featured Badge */}
                  {item.isFeatured && (
                    <span className="absolute top-2 left-2 bg-[#2E7D32] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Primary Cover
                    </span>
                  )}

                  {/* 360 Panorama Badge */}
                  {selectedCategory === 'panoramas' && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                      360° Pano
                    </span>
                  )}
                </div>

                {/* Caption & Controls */}
                <div className="p-3 bg-white space-y-2">
                  <input
                    type="text"
                    value={item.caption || item.roomName || item.title || ''}
                    placeholder="Room Label (e.g. Master Bedroom)"
                    onChange={(e) => {
                      const list = [...currentCategoryItems];
                      list[idx] = { ...list[idx], caption: e.target.value, roomName: e.target.value };
                      onChange({ ...media, [selectedCategory]: list });
                    }}
                    className="w-full text-xs font-semibold border-b border-gray-100 pb-1 focus:outline-none focus:border-[#C62828]"
                  />

                  <div className="flex items-center justify-between pt-1 text-gray-500">
                    {/* Reorder Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(selectedCategory, idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:text-black disabled:opacity-30"
                        title="Move Left/Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(selectedCategory, idx, 1)}
                        disabled={idx === currentCategoryItems.length - 1}
                        className="p-1 hover:text-black disabled:opacity-30"
                        title="Move Right/Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Set Primary Button */}
                    {selectedCategory !== 'walkthroughVideos' && !item.isFeatured && (
                      <button
                        type="button"
                        onClick={() => handleSetFeatured(selectedCategory, idx)}
                        className="text-[10px] font-bold text-gray-500 hover:text-[#C62828]"
                      >
                        Set as Cover
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(selectedCategory, idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorizedMediaUploader;
