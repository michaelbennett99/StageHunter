'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { along } from '@turf/along';

import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map(
  { track, distance }: { track: GeoJSON.LineString, distance: number | null }
): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const INITIAL_ZOOM = 7;

  const bounds = useMemo(() => {
    const track_coords = track.coordinates as [number, number][];
    const bounds = new mapboxgl.LngLatBounds();
    track_coords.forEach(coord => bounds.extend(coord));
    return bounds;
  }, [track]);

  const point = useMemo(() => {
    if (distance === null) return null;
    return along(track, distance / 1000);
  }, [track, distance]);

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: bounds.getCenter(),
      zoom: INITIAL_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: track
      });

      map.addLayer({
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

      map.addSource('point', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: {
          'circle-color': '#000',
          'circle-radius': 10
        }
      });

      map.fitBounds(bounds, {
        padding: 100
      });

      setIsMapReady(true);
    });

    return () => {
      setIsMapReady(false);
      map.remove();
    };
  }, []);

  // Update point location
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    try {
      const source = mapRef.current.getSource('point') as mapboxgl.GeoJSONSource;

      source.setData({
        type: 'FeatureCollection',
        features: point ? [point] : []
      });
    } catch (error) {
      console.error('Error updating point:', error);
    }
  }, [point, isMapReady]);

  const handleButtonClick = () => {
    mapRef.current?.fitBounds(bounds, {
      padding: 100
    });
  };

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
