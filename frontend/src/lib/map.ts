export function trySetMapConfig(
  map: mapboxgl.Map,
  key: string,
  value: boolean | number | string
) {
  try {
    map.setConfigProperty('basemap', key, value);
  } catch (error) {
    console.warn('Error setting config property:', error);
  }
}
