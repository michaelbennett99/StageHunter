'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import mapboxgl from 'mapbox-gl';
import { along } from '@turf/along';

import MapResetButton from './map/mapResetButton';

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
    // Bounds and track are never updated, and if they were we would not want to
    // re-initialize the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div
      id="map-container-container"
      className="h-full relative"
    >
      <MapResetButton
        mapRef={mapRef}
        bounds={bounds}
        id="map-reset-button"
      />
      <div
        className="h-full rounded-md shadow-md"
        id="map-container"
        ref={mapContainerRef}
      />
    </div>
  );
}
