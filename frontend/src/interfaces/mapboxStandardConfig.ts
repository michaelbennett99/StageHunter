interface ConfigOption {
  value: string;
  label: string;
}

export const themeOptions: ConfigOption[] = [
  { value: 'default', label: 'Default' },
  { value: 'faded', label: 'Faded' },
  { value: 'monochrome', label: 'Monochrome' }
] as const;

export const lightPresetOptions: ConfigOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'dusk', label: 'Dusk' }
] as const;

export type MapboxTheme = typeof themeOptions[number]['value'];
export type MapboxLightPreset = typeof lightPresetOptions[number]['value'];

export interface MapboxStandardConfig {
  showPedestrianRoads?: boolean;
  showPlaceLabels?: boolean;
  showPointOfInterestLabels?: boolean;
  showRoadLabels?: boolean;
  showTransitLabels?: boolean;
  show3dObjects?: boolean;
  theme?: MapboxTheme;
  lightPreset?: MapboxLightPreset;
}

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

export const showOptions: Record<keyof MapboxStandardConfig, boolean> = {
  showPedestrianRoads: true,
  showPlaceLabels: true,
  showPointOfInterestLabels: true,
  showRoadLabels: true,
  showTransitLabels: true,
  show3dObjects: true,
  theme: false,
  lightPreset: false
};

export const configOptions: Partial<
  Record<keyof MapboxStandardConfig, ConfigOption[]>
> = {
  theme: themeOptions,
  lightPreset: lightPresetOptions
};

const defaultAllConfig: MapboxStandardConfig = {
  showPedestrianRoads: true,
  showPlaceLabels: true,
  showPointOfInterestLabels: false,
  showRoadLabels: false,
  showTransitLabels: false,
  show3dObjects: true,
  theme: 'default',
  lightPreset: 'day'
};

export const defaultConfig: MapboxStandardConfig = Object.fromEntries(
  Object.entries(defaultAllConfig)
    .filter(([key]) => showOptions[key as keyof MapboxStandardConfig])
) as MapboxStandardConfig;
