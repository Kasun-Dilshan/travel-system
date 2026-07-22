import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in standard Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ stops = [], path = [], height = '350px', dayMode = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const allCoords = path.length > 0 
      ? path.map(p => [p.lat, p.lng]) 
      : stops.map(s => [s.lat, s.lng]);

    if (allCoords.length === 0) return;

    // Initialize Map
    mapInstance.current = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView(allCoords[0], 13);

    // Add Tile Layer (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(mapInstance.current);

    // Add Path
    if (path.length > 1) {
      L.polyline(path.map(p => [p.lat, p.lng]), {
        color: 'hsl(142, 76%, 36%)',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(mapInstance.current);
    }

    // Add Markers (day number when available)
    stops.forEach((stop, idx) => {
      const markerNum = dayMode && stop.day ? stop.day : idx + 1;
      const customIcon = L.divIcon({
        className: 'custom-numbered-marker',
        html: `<div style="
          background-color: hsl(142 76% 36%);
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${markerNum}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([stop.lat, stop.lng], { icon: customIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<b>${stop.label || (dayMode ? `Day ${markerNum}` : `Stop ${idx + 1}`)}</b>`);
    });

    // Fit Bounds
    const bounds = L.latLngBounds(allCoords);
    mapInstance.current.fitBounds(bounds, { padding: [40, 40] });

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [stops, path, dayMode]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '1.5rem', 
        overflow: 'hidden',
        border: '1px solid hsl(var(--primary) / 0.1)',
        zIndex: 1
      }} 
    />
  );
}
