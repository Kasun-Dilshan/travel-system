import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function collectCoords(stops = [], path = []) {
  const source = path.length > 0 ? path : stops;
  return source
    .map((p) => [Number(p?.lat), Number(p?.lng)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

export default function MapComponent({ stops = [], path = [], height = '350px', dayMode = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroupRef = useRef(null);
  const boundsRef = useRef(null);

  const fitToRoute = () => {
    const map = mapInstance.current;
    const bounds = boundsRef.current;
    if (!map || !bounds || !bounds.isValid()) return;
    map.invalidateSize({ animate: false });
    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: 12,
      animate: false,
    });
  };

  // Create map once; keep container size in sync with popup/modal layout.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([7.8731, 80.7718], 7);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    // Modal/popup often finishes layout after first paint (Framer Motion, scroll, etc.)
    const t1 = window.setTimeout(fitToRoute, 50);
    const t2 = window.setTimeout(fitToRoute, 250);
    const t3 = window.setTimeout(fitToRoute, 500);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        fitToRoute();
      });
      resizeObserver.observe(mapRef.current);
    }

    const onWindowResize = () => fitToRoute();
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', onWindowResize);
      resizeObserver?.disconnect();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      layerGroupRef.current = null;
      boundsRef.current = null;
    };
  }, []);

  // Draw route + fit all stops inside the visible popup map area.
  useEffect(() => {
    const map = mapInstance.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    const allCoords = collectCoords(stops, path);
    group.clearLayers();
    boundsRef.current = null;

    if (allCoords.length === 0) return;

    if (path.length > 1) {
      const pathCoords = collectCoords([], path);
      if (pathCoords.length > 1) {
        L.polyline(pathCoords, {
          color: 'hsl(142, 76%, 36%)',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(group);
      }
    }

    stops.forEach((stop, idx) => {
      const lat = Number(stop?.lat);
      const lng = Number(stop?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

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

      L.marker([lat, lng], { icon: customIcon })
        .addTo(group)
        .bindPopup(`<b>${stop.label || (dayMode ? `Day ${markerNum}` : `Stop ${idx + 1}`)}</b>`);
    });

    boundsRef.current = L.latLngBounds(allCoords);
    fitToRoute();
    const t1 = window.setTimeout(fitToRoute, 80);
    const t2 = window.setTimeout(fitToRoute, 320);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
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
        zIndex: 1,
      }}
    />
  );
}
