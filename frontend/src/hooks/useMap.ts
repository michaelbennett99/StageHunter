import { MutableRefObject, useRef, useState, useEffect } from "react";

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

    const firstPoint = track.coordinates[0];
    const lastPoint = track.coordinates[track.coordinates.length - 1];

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

      mapRef.current = map;

      function addSymbolLayer(
        sourceId: string,
        image: string
      ) {
        // If the image already exists, add the layer
        if (map.hasImage(sourceId)) {
          map.addLayer({
            id: sourceId,
            type: 'symbol',
            source: sourceId,
            layout: {
              'icon-image': sourceId,
              'icon-size': 0.5,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
          return;
        }

        // If the image doesn't exist, load it
        map.loadImage(image, (error, image) => {
          if (error) throw error;
          if (image) {
            map.addImage(sourceId, image);

            map.addLayer({
              id: sourceId,
              type: 'symbol',
              source: sourceId,
              layout: {
                'icon-image': sourceId,
                'icon-size': 0.5,
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
              }
            });
          }
        });
      }

      function initialiseLayers() {
        // Add terrain layer
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
        })

        // Add route layer
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
            'line-color': '#3b82f6',
            'line-width': [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              10,
              4,
              16,
              8,
              22,
              24
            ],
            'line-emissive-strength': 1,
          }
        });

        map.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1d4ed8',
            'line-width': [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2.8,
              10,
              5.6,
              16,
              11.3,
              22,
              33.6
            ],
            'line-emissive-strength': 1,
          }
        }, 'route');

        // Add start point layer
        map.addSource('start', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              'name': 'Start'
            },
            geometry: {
              type: 'Point',
              coordinates: firstPoint
            }
          }
        });

        addSymbolLayer('start', '/assets/icons/map/start-64.png');

        // Add finish point layer
        map.addSource('finish', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              'name': 'Finish'
            },
            geometry: {
              type: 'Point',
              coordinates: lastPoint
            }
          }
        });

        addSymbolLayer('finish', '/assets/icons/map/finish-64.png');

        // Add point on route layer
        map.addSource('point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Load custom marker image
        addSymbolLayer('point', '/assets/icons/map/marker-64.png');
      }

      // Handle window resize
      const resizeHandler = () => {
        map.resize();
      };
      window.addEventListener('resize', resizeHandler);

      map.on('load', () => {
        if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
          console.info("map loaded");
        }

        map.fitBounds(bounds, {
          padding: 100
        });
        setIsMapReady(true);
      });

      map.on('style.load', () => {
        if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
          console.info("style loaded");
        }

        initialiseLayers();
      });

      map.on('error', (e) => {
        if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
          console.info("error", e);
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    mapRef,
    mapContainerRef,
    isMapReady,
    error
  };
}
