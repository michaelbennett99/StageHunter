export type MapboxTheme = 'default' | 'faded' | 'monochrome'
export type MapboxLightPreset = 'day' | 'night' | 'dawn' | 'dusk'

export interface MapboxStandardConfig {
  showPedestrianRoads: boolean;
  showPlaceLabels: boolean;
  showPointOfInterestLabels: boolean;
  showRoadLabels: boolean;
  showTransitLabels: boolean;
  show3dObjects: boolean;
  theme: MapboxTheme;
  lightPreset: MapboxLightPreset;
}

export const defaultConfig: MapboxStandardConfig = {
  showPedestrianRoads: true,
  showPlaceLabels: true,
  showPointOfInterestLabels: false,
  showRoadLabels: false,
  showTransitLabels: false,
  show3dObjects: true,
  theme: 'default',
  lightPreset: 'day'
};

// UI display configuration - separate from the actual config values
export const configLabels: Record<keyof MapboxStandardConfig, string> = {
  showPedestrianRoads: 'Show Pedestrian Roads',
  showPlaceLabels: 'Show Place Labels',
  showPointOfInterestLabels: 'Show POI Labels',
  showRoadLabels: 'Show Road Labels',
  showTransitLabels: 'Show Transit Labels',
  show3dObjects: 'Show 3D Objects',
  theme: 'Theme',
  lightPreset: 'Light Preset'
};

export const themeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'faded', label: 'Faded' },
  { value: 'monochrome', label: 'Monochrome' }
] as const;

export const lightPresetOptions = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'dusk', label: 'Dusk' }
] as const;
