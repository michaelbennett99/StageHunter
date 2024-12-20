'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import mapboxgl, { ConfigSpecification } from 'mapbox-gl';
import { along } from '@turf/along';

import useUpdatePoint from '@/hooks/useUpdatePoint';
import { mapboxStyleMap } from '@/interfaces/mapboxStyles';
import { defaultConfig } from '@/interfaces/mapboxStandardConfig';
import MapButtons from './map/mapButtons';

import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map(
  { track, distance }: { track: GeoJSON.LineString, distance: number | null }
): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const INITIAL_ZOOM = 7;
  const DEFAULT_STYLE = 'standard';
  const DEFAULT_CONFIG = defaultConfig;

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
      style: mapboxStyleMap[DEFAULT_STYLE].url,
      config: {
        basemap: DEFAULT_CONFIG as unknown as ConfigSpecification
      }
    });

    mapRef.current = map;

    function initialiseLayers() {
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
    }

    map.on('load', () => {
      map.fitBounds(bounds, {
        padding: 100
      });

      setIsMapReady(true);
    });

    map.on('style.load', () => {
      initialiseLayers();
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
