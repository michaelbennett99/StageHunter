export function trySetMapConfig(map: mapboxgl.Map, key: string, value: any) {
  try {
    map.setConfigProperty(
      'basemap', key, value
    );
  } catch (error) {
    console.error('Error setting config property:', error);
  }
}
