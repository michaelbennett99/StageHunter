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

    const resetButton = document.getElementById('reset-button');

    mapRef.current.on('move', () => {
      if (atInitialPoint()) {
        // hide the reset button
        resetButton?.classList.add('hidden');
      } else {
        // show the reset button
        resetButton?.classList.remove('hidden');
      }
    });

    return () => mapRef.current?.remove();
  }, []);

  const handleButtonClick = () => {
    mapRef.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    })
  }

  const atInitialPoint = () => {
    const center = mapRef.current?.getCenter();
    const zoom = mapRef.current?.getZoom();
    return zoom === INITIAL_ZOOM && center?.lng === INITIAL_CENTER[0] && center?.lat === INITIAL_CENTER[1];
  }

  return (
    <div id="map-container-container" className="h-full relative">
      <button
        onClick={handleButtonClick}
        className="absolute top-2 right-2 z-10 bg-black text-white p-2 rounded-md shadow-md hidden bg-opacity-50 hover:bg-opacity-100"
        id="reset-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
      <div
        className="h-full"
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}
