export type MapboxTheme = 'default' | 'faded' | 'monochrome'
export type MapboxLightPreset = 'day' | 'night' | 'dawn' | 'dusk'

type BooleanConfigItem = {
  type: 'boolean';
  id: string;
  label: string;
  value: boolean;
}

type SelectConfigItem<T extends string> = {
  type: 'select';
  id: string;
  label: string;
  value: T;
  options: Array<{
    value: T;
    label: string;
  }>;
}

type ConfigItem =
  | BooleanConfigItem
  | SelectConfigItem<MapboxTheme>
  | SelectConfigItem<MapboxLightPreset>;

export const MapboxStandardConfig = {
  showPedestrianRoads: {
    type: 'boolean',
    id: 'showPedestrianRoads',
    label: 'Show Pedestrian Roads',
    value: false
  },
  showPlaceLabels: {
    type: 'boolean',
    id: 'showPlaceLabels',
    label: 'Show Place Labels',
    value: true
  },
  showPointOfInterestLabels: {
    type: 'boolean',
    id: 'showPointOfInterestLabels',
    label: 'Show POI Labels',
    value: true
  },
  showRoadLabels: {
    type: 'boolean',
    id: 'showRoadLabels',
    label: 'Show Road Labels',
    value: false
  },
  showTransitLabels: {
    type: 'boolean',
    id: 'showTransitLabels',
    label: 'Show Transit Labels',
    value: false
  },
  show3dObjects: {
    type: 'boolean',
    id: 'show3dObjects',
    label: 'Show 3D Objects',
    value: true
  },
  theme: {
    type: 'select',
    id: 'theme',
    label: 'Theme',
    value: 'default' as MapboxTheme,
    options: [
      { value: 'default', label: 'Default' },
      { value: 'faded', label: 'Faded' },
      { value: 'monochrome', label: 'Monochrome' }
    ]
  },
  lightPreset: {
    type: 'select',
    id: 'lightPreset',
    label: 'Light Preset',
    value: 'day' as MapboxLightPreset,
    options: [
      { value: 'day', label: 'Day' },
      { value: 'night', label: 'Night' },
      { value: 'dawn', label: 'Dawn' },
      { value: 'dusk', label: 'Dusk' }
    ]
  }
} as const;

export type MapboxStandardConfigKey = keyof typeof MapboxStandardConfig;
export type MapboxStandardConfig = typeof MapboxStandardConfig;

export function getConfig(config: MapboxStandardConfig) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      return [key, value.value];
    })
  );
}
