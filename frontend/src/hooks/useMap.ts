import { MutableRefObject, useRef, useState, useMemo, useEffect } from "react";

import mapboxgl, { ConfigSpecification } from "mapbox-gl";

import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { MapboxStyleId, mapboxStyleMap } from "@/interfaces/mapboxStyles";

type Returns = {
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  isMapReady: boolean,
  error: string | null,
}

/**
 * A function that initializes a map and returns a ref to the map and a ref to the map container
 * @param track - The track to display on the map
 * @param bounds - The bounds of the track
 * @param initialZoom - The initial zoom level
 * @param initialStyle - The initial style of the map
 * @param initialConfig - The initial config of the map
 * @returns A ref to the map and a ref to the map container
 */
export default function useMap(
  track: GeoJSON.LineString,
  bounds: mapboxgl.LngLatBounds,
  initialZoom: number,
  initialStyle: MapboxStyleId,
  initialConfig: MapboxStandardConfig
): Returns {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token is missing');
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        center: bounds.getCenter(),
        zoom: initialZoom,
        style: mapboxStyleMap[initialStyle].url,
        config: {
          basemap: initialConfig as unknown as ConfigSpecification
        }
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

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

        // Add point shadow
        map.addLayer({
          id: 'point-shadow',
          type: 'circle',
          source: 'point',
          paint: {
            'circle-radius': 12,
            'circle-color': '#000',
            'circle-opacity': 0.4,
            'circle-blur': 1
          }
        });

        // Add main point
        map.addLayer({
          id: 'point',
          type: 'circle',
          source: 'point',
          paint: {
            'circle-color': '#fff',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#000'
          }
        });
      }

      // Handle window resize
      const resizeHandler = () => {
        map.resize();
      };
      window.addEventListener('resize', resizeHandler);

      map.on('load', () => {
        map.fitBounds(bounds, {
          padding: 100
        });
        setIsMapReady(true);
      });

      map.on('style.load', () => {
        initialiseLayers();
      });

      map.on('error', (e) => {
        setError(e.error.message);
      });

      return () => {
        window.removeEventListener('resize', resizeHandler);
        setIsMapReady(false);
        map.remove();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, []);

  return {
    mapRef,
    mapContainerRef,
    isMapReady,
    error
  };
}
