export type MapboxTheme = 'default' | 'faded' | 'monochrome'
export type MapboxLightPreset = 'day' | 'night' | 'dawn' | 'dusk'

export const MapboxStandardConfig = {
  showPedestrianRoads: {
    id: 'showPedestrianRoads' as const,
    label: 'Show Pedestrian Roads' as const,
    value: false
  },
  showPlaceLabels: {
    id: 'showPlaceLabels' as const,
    label: 'Show Place Labels' as const,
    value: true
  },
  showPOILabels: {
    id: 'showPOILabels' as const,
    label: 'Show POI Labels' as const,
    value: true
  },
  showRoadLabels: {
    id: 'showRoadLabels' as const,
    label: 'Show Road Labels' as const,
    value: false
  },
  showTransitLabels: {
    id: 'showTransitLabels' as const,
    label: 'Show Transit Labels' as const,
    value: false
  },
  show3dObjects: {
    id: 'show3dObjects' as const,
    label: 'Show 3D Objects' as const,
    value: true
  },
  theme: {
    id: 'theme' as const,
    label: 'Theme' as const,
    value: 'default' as MapboxTheme
  },
  lightPreset: {
    id: 'lightPreset' as const,
    label: 'Light Preset' as const,
    value: 'day' as MapboxLightPreset
  }
};

export type MapboxStandardConfigKey = keyof typeof MapboxStandardConfig;
export type MapboxStandardConfig = typeof MapboxStandardConfig;
