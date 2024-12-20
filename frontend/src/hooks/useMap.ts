import { MutableRefObject, useRef, useState, useMemo, useEffect } from "react";

import mapboxgl, { ConfigSpecification } from "mapbox-gl";

import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { MapboxStyleId, mapboxStyleMap } from "@/interfaces/mapboxStyles";

type Returns = {
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  isMapReady: boolean,
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

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: bounds.getCenter(),
      zoom: initialZoom,
      style: mapboxStyleMap[initialStyle].url,
      config: {
        basemap: initialConfig as unknown as ConfigSpecification
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
    // We never want to re-initialize the map
    // All the dependencies should never be updated for a map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    mapRef,
    mapContainerRef,
    isMapReady
  }
}
