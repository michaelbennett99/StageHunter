'use client';
import 'mapbox-gl/dist/mapbox-gl.css';

import MapButtons from './map/mapButtons';

import useMap from '@/hooks/useMap';
import usePoint from '@/hooks/usePoint';
import useBounds from '@/hooks/useBounds';
import useUpdatePoint from '@/hooks/useUpdatePoint';

import { INITIAL_ZOOM, DEFAULT_STYLE, DEFAULT_CONFIG } from '@/config/map';

export default function Map(
  { track, distance }: { track: GeoJSON.LineString, distance: number | null }
): JSX.Element {
  const point = usePoint(track, distance);
  const bounds = useBounds(track);

  const { mapRef, mapContainerRef, isMapReady } = useMap(
    track, bounds, INITIAL_ZOOM, DEFAULT_STYLE, DEFAULT_CONFIG
  );

  // Update point location
  useUpdatePoint(mapRef, isMapReady, point);

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
      <div
        className="h-full rounded-md shadow-md"
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}
