const MAPBOX_STYLES = {
  standard: {
    id: 'standard' as const,
    url: 'mapbox://styles/mapbox/standard',
    name: 'Mapbox Standard'
  },
  standardSatellite: {
    id: 'standardSatellite' as const,
    url: 'mapbox://styles/mapbox/standard-satellite',
    name: 'Mapbox Standard Satellite'
  },
  streets: {
    id: 'streets' as const,
    url: 'mapbox://styles/mapbox/streets-v12',
    name: 'Mapbox Streets'
  },
  satellite: {
    id: 'satellite' as const,
    url: 'mapbox://styles/mapbox/satellite-v9',
    name: 'Mapbox Satellite'
  },
  outdoors: {
    id: 'outdoors' as const,
    url: 'mapbox://styles/mapbox/outdoors-v12',
    name: 'Mapbox Outdoors'
  },
  light: {
    id: 'light' as const,
    url: 'mapbox://styles/mapbox/light-v11',
    name: 'Mapbox Light'
  },
  dark: {
    id: 'dark' as const,
    url: 'mapbox://styles/mapbox/dark-v11',
    name: 'Mapbox Dark'
  },
  satelliteStreets: {
    id: 'satelliteStreets' as const,
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    name: 'Mapbox Satellite Streets'
  },
  navigationDay: {
    id: 'navigationDay' as const,
    url: 'mapbox://styles/mapbox/navigation-day-v1',
    name: 'Mapbox Navigation Day'
  },
  navigationNight: {
    id: 'navigationNight' as const,
    url: 'mapbox://styles/mapbox/navigation-night-v1',
    name: 'Mapbox Navigation Night'
  }
} as const;

export type MapboxStyleId = typeof MAPBOX_STYLES[
  keyof typeof MAPBOX_STYLES
]['id'];
export type MapboxStyle = typeof MAPBOX_STYLES[keyof typeof MAPBOX_STYLES];
export const mapboxStyleMap = MAPBOX_STYLES;
export const mapboxStyles = Object.values(MAPBOX_STYLES);
