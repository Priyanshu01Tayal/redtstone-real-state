import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix default leaflet marker icon in bundlers
const createCustomIcon = (priceText, isSelected) => {
  return L.divIcon({
    className: 'custom-property-pin',
    html: `
      <div style="
        background: ${isSelected ? '#222222' : '#C62828'};
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 14px;
        box-shadow: 0 4px 10px rgba(198, 40, 40, 0.4);
        display: flex;
        align-items: center;
        gap: 4px;
        border: 2px solid #ffffff;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        transition: transform 0.2s ease;
      ">
        <span>₹</span>
        <span>${priceText}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createDraggableIcon = () => {
  return L.divIcon({
    className: 'draggable-pin',
    html: `
      <div style="
        background: #C62828;
        color: #ffffff;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) translate(-25%, -25%);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

function formatCompactPrice(price) {
  if (!price) return '0';
  if (price >= 10000000) return (price / 10000000).toFixed(2) + ' Cr';
  if (price >= 100000) return (price / 100000).toFixed(1) + ' L';
  if (price >= 1000) return (price / 1000).toFixed(0) + ' K';
  return price.toString();
}

const PropertyMap = ({
  properties = [],
  availabilityHeatmap = [],
  demandHeatmap = [],
  activeLayer = 'pins', // 'pins' | 'availability' | 'demand'
  center = [28.628, 77.3653], // [lat, lng]
  zoom = 12,
  selectablePin = false,
  selectedCoordinates = null,
  onCoordinateSelect = null,
  onBoundsChange = null,
  onPropertySelect = null,
  selectedPropertyId = null,
  height = '500px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const draggableMarkerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // OpenStreetMap standard tile layer with optional env-configured tile provider
      const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileKey = import.meta.env.VITE_MAP_TILE_KEY || '';
      const finalUrl = tileKey ? `${tileUrl}?key=${tileKey}` : tileUrl;

      const baseTileLayer = L.tileLayer(finalUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      });

      baseTileLayer.on('tileerror', (error) => {
        console.warn('Primary map tile load failed, using OpenStreetMap fallback:', error);
      });

      baseTileLayer.addTo(map);

      // Layers groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      heatmapLayerRef.current = L.layerGroup().addTo(map);

      // Event listener for viewport boundaries
      map.on('moveend', () => {
        if (onBoundsChange) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            const bounds = map.getBounds();
            onBoundsChange({
              swLng: bounds.getSouthWest().lng,
              swLat: bounds.getSouthWest().lat,
              neLng: bounds.getNorthEast().lng,
              neLat: bounds.getNorthEast().lat,
            });
          }, 350);
        }
      });

      // Event listener for click coordinate selection
      if (selectablePin) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (onCoordinateSelect) {
            onCoordinateSelect({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
          }
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Update center & zoom if changed from props
  useEffect(() => {
    if (mapInstanceRef.current && center && center[0] && center[1]) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center?.[0], center?.[1], zoom]);

  // Handle Selectable Pin Mode (Add Property Wizard)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectablePin) return;

    const map = mapInstanceRef.current;
    const currentCoords = selectedCoordinates || { lat: center[0], lng: center[1] };

    if (!draggableMarkerRef.current) {
      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        icon: createDraggableIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (onCoordinateSelect) {
          onCoordinateSelect({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) });
        }
      });

      draggableMarkerRef.current = marker;
    } else {
      draggableMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    }
  }, [selectablePin, selectedCoordinates?.lat, selectedCoordinates?.lng]);

  // Render Property Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (activeLayer === 'pins' && properties && properties.length > 0) {
      properties.forEach((prop) => {
        const lng = prop.location?.coordinates?.[0] || prop.coordinates?.lng;
        const lat = prop.location?.coordinates?.[1] || prop.coordinates?.lat;

        if (lat && lng) {
          const isSelected = selectedPropertyId === prop._id;
          const marker = L.marker([lat, lng], {
            icon: createCustomIcon(formatCompactPrice(prop.price), isSelected),
          });

          const popupContent = `
            <div style="width: 220px; font-family: sans-serif; padding: 2px;">
              <img src="${prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}" 
                   style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
              <div style="font-weight: 700; font-size: 14px; color: #C62828; margin-bottom: 2px;">
                ₹${formatCompactPrice(prop.price)}
                <span style="font-size: 11px; font-weight: 500; color: #777;">(${prop.purpose === 'rent' ? '/mo' : 'Total'})</span>
              </div>
              <div style="font-weight: 600; font-size: 13px; color: #222; margin-bottom: 4px; line-height: 1.2;">
                ${prop.title}
              </div>
              <div style="font-size: 11px; color: #666; margin-bottom: 6px;">
                📍 ${prop.locality}, ${prop.city}
              </div>
              <div style="display: flex; gap: 6px; font-size: 11px; font-weight: 600; color: #444; background: #f5f5f5; padding: 4px 6px; border-radius: 4px;">
                ${prop.bhk ? `<span>${prop.bhk} BHK</span> •` : ''}
                <span>${prop.area} ${prop.areaUnit || 'sq ft'}</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          marker.on('click', () => {
            if (onPropertySelect) onPropertySelect(prop);
          });

          markersLayerRef.current.addLayer(marker);

          // Open popup if this marker is selected
          if (isSelected) {
            setTimeout(() => {
              marker.openPopup();
            }, 100);
          }
        }
      });
    }
  }, [properties, activeLayer, selectedPropertyId]);

  // Two-way synchronization: smoothly pan to selected property when selected from list
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPropertyId || !properties || properties.length === 0) return;
    const selected = properties.find((p) => p._id === selectedPropertyId);
    if (selected) {
      const lng = selected.location?.coordinates?.[0] || selected.coordinates?.lng;
      const lat = selected.location?.coordinates?.[1] || selected.coordinates?.lat;
      if (lat && lng) {
        mapInstanceRef.current.flyTo([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 14), {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    }
  }, [selectedPropertyId, properties]);

  // Render Heatmaps (Layer A - Availability / Layer B - Demand)
  useEffect(() => {
    if (!heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    // LAYER A: AVAILABILITY HEATMAP
    if (activeLayer === 'availability' && availabilityHeatmap && availabilityHeatmap.length > 0) {
      availabilityHeatmap.forEach((cluster) => {
        const [lng, lat] = cluster.coordinates || [];
        if (!lat || !lng) return;

        // Radius scaled by count
        const radius = Math.min(45, Math.max(18, cluster.count * 8));
        const color = cluster.count >= 4 ? '#C62828' : cluster.count >= 2 ? '#E53935' : '#FB8C00';

        const circle = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          fillOpacity: 0.55,
          color: '#ffffff',
          weight: 2,
        });

        const popupContent = `
          <div style="width: 220px; font-family: sans-serif; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: #FFCDD2; color: #C62828; padding: 2px 6px; border-radius: 4px;">
                SUPPLY CLUSTER
              </span>
              <span style="font-weight: 700; color: #C62828;">${cluster.count} Active Units</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 700; color: #222; margin: 4px 0;">${cluster.locality}</h4>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Avg Price: <b>₹${formatCompactPrice(cluster.avgPrice)}</b></div>
            <div style="background: #f8f8f8; padding: 6px; border-radius: 6px; font-size: 11px;">
              <div>🏠 Residential: <b>${cluster.breakdown?.residential || 0}</b></div>
              <div>🏢 Commercial: <b>${cluster.breakdown?.commercial || 0}</b></div>
              <div>🔑 For Sale: <b>${cluster.breakdown?.sale || 0}</b> | Rent: <b>${cluster.breakdown?.rent || 0}</b></div>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        heatmapLayerRef.current.addLayer(circle);
      });
    }

    // LAYER B: DEMAND HEATMAP (ANONYMIZED)
    if (activeLayer === 'demand' && demandHeatmap && demandHeatmap.length > 0) {
      demandHeatmap.forEach((cluster) => {
        const [lng, lat] = cluster.coordinates || [];
        if (!lat || !lng) return;

        const radius = Math.min(48, Math.max(20, cluster.demandScore * 10));

        const circle = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: '#1E88E5',
          fillOpacity: 0.6,
          color: '#ffffff',
          weight: 2,
        });

        const popupContent = `
          <div style="width: 220px; font-family: sans-serif; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: #BBDEFB; color: #1565C0; padding: 2px 6px; border-radius: 4px;">
                BUYER DEMAND CLUSTER
              </span>
              <span style="font-weight: 700; color: #1565C0;">${cluster.demandScore} Qualified Leads</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 700; color: #222; margin: 4px 0;">${cluster.locality}</h4>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">Avg Buyer Budget: <b>₹${formatCompactPrice(cluster.avgMaxBudget)}</b></div>
            <div style="background: #E3F2FD; padding: 6px; border-radius: 6px; font-size: 11px; color: #0D47A1;">
              <div>🎯 Active Buyers: <b>${cluster.purposeDemand?.sale || 0}</b></div>
              <div>🔑 Active Tenants: <b>${cluster.purposeDemand?.rent || 0}</b></div>
              <div style="margin-top: 4px; font-style: italic; font-size: 10px;">🔒 Anonymized aggregate requirement data</div>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        heatmapLayerRef.current.addLayer(circle);
      });
    }
  }, [activeLayer, availabilityHeatmap, demandHeatmap]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#EEEEEE] shadow-sm">
      <div ref={mapContainerRef} style={{ width: '100%', height: height, zIndex: 10 }} />

      {selectablePin && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-[#EEEEEE] text-xs font-semibold text-[#222222]">
          📍 Drag the red marker or click anywhere to set exact location coordinates
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
