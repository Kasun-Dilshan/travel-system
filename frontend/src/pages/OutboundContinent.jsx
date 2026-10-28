import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getContinentById } from '../data/outbound-regions';
import useOutboundContinents from '../hooks/useOutboundContinents';

/** Legacy continent URL → mega-menu with region preselected. */
export default function OutboundContinent() {
  const { continentId } = useParams();
  const { continents, isLoading } = useOutboundContinents();
  const continent = getContinentById(continentId, continents);

  if (!continent) {
    if (isLoading) {
      return (
        <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
          Loading…
        </div>
      );
    }
    return <Navigate to="/outbound/destinations" replace />;
  }

  return <Navigate to={`/outbound/destinations?region=${continent.id}`} replace />;
}
