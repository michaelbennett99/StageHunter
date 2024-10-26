'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map(
): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const INITIAL_CENTER: [number, number] = [0, 51.5];
  const INITIAL_ZOOM = 9;

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    return () => mapRef.current?.remove();
  }, []);

  const handleButtonClick = () => {
    mapRef.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    })
  }

  return (
    <div id="map-container-container" className="h-full">
      <button
        onClick={handleButtonClick}
        className="absolute top-2 left-2 z-10 bg-white p-2 rounded-md shadow-md"
      >
        Reset
      </button>
      <div
        className="h-full"
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}
