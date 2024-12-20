import { useState } from "react";

import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import useChangeMapConfig from "@/hooks/useChangeMapConfig";

export default function useMapConfig(
    mapRef: React.RefObject<mapboxgl.Map>,
    isMapReady: boolean,
    defaultConfig: MapboxStandardConfig
) {
    const [config, setConfig] = useState(defaultConfig);
    useChangeMapConfig(mapRef, isMapReady, config);
    return { config, setConfig };
}
