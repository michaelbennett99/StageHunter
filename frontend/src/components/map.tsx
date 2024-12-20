'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback } from 'react';

import MapButtons from './map/mapButtons';
import { Loader2 } from 'lucide-react';

import useMap from '@/hooks/useMap';
import usePoint from '@/hooks/usePoint';
import useBounds from '@/hooks/useBounds';
import useUpdatePoint from '@/hooks/useUpdatePoint';
import useTerrain from '@/hooks/useTerrain';

import { INITIAL_ZOOM, DEFAULT_STYLE, DEFAULT_CONFIG } from '@/config/map';

export default function Map(
  { track, distance }: { track: GeoJSON.LineString, distance: number | null }
): JSX.Element {
  const point = usePoint(track, distance);
  const bounds = useBounds(track);

  const { mapRef, mapContainerRef, isMapReady, error } = useMap(
    track, bounds, INITIAL_ZOOM, DEFAULT_STYLE, DEFAULT_CONFIG
  );

  // Update point location
  useUpdatePoint(mapRef, isMapReady, point);
  useTerrain(mapRef, isMapReady, 2);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-destructive/10 rounded-md">
        <p className="text-destructive">Failed to load map: {error}</p>
      </div>
    );
  }

  return (
    <div
      id="map-container-container"
      className="h-full relative"
    >
      <MapButtons
        mapRef={mapRef}
        bounds={bounds}
        isMapReady={isMapReady}
        defaultConfig={DEFAULT_CONFIG}
        defaultStyle={DEFAULT_STYLE}
      />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      <div
        className="h-full rounded-md shadow-md"
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}
