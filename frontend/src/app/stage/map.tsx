'use client';

import { useRef, useEffect, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { along } from '@turf/along';

import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map(
  { track, distance }: { track: GeoJSON.LineString, distance: number | null }
): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const INITIAL_ZOOM = 7;

  const bounds = useMemo(() => {
    const track_coords = track.coordinates as [number, number][];
    const bounds = new mapboxgl.LngLatBounds();
    track_coords.forEach(coord => bounds.extend(coord));
    return bounds;
  }, [track]);

  // Calculate the highlighted point location
  const point = useMemo(() => {
    if (distance === null) return null;
    return along(track, distance / 1000);
  }, [track, distance]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: bounds.getCenter(),
      zoom: INITIAL_ZOOM,
    });

    // Stage route track
    mapRef.current?.on('load', () => {
      mapRef.current?.addSource('route', {
        type: 'geojson',
        data: track
      });

      mapRef.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000',
          'line-width': 4
        }
      });

      // Location point
      mapRef.current?.addSource('point', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      mapRef.current?.addLayer({
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: {
          'circle-color': '#000',
          'circle-radius': 10
        }
      });

      mapRef.current?.fitBounds(bounds, {
        padding: 100
      });
    });

    return () => mapRef.current?.remove();
  }, []);

  // Update point location
  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded()) return;

    const source = mapRef.current?.getSource('point') as mapboxgl.GeoJSONSource;

    if (point === null) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    };

    source.setData({
      type: 'FeatureCollection',
      features: [point]
    });
  }, [point]);

  const handleButtonClick = () => {
    mapRef.current?.fitBounds(bounds, {
      padding: 100
    })
  }

  return (
    <div id="map-container-container" className="h-full relative">
      <button
        onClick={handleButtonClick}
        className="absolute top-2 right-2 z-10 bg-black text-white p-2 rounded-md shadow-md bg-opacity-50 hover:bg-opacity-100"
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
