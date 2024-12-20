import { useState } from "react";

import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import useChangeMapConfig from "@/hooks/useChangeMapConfig";

export default function useMapConfig(
    mapRef: React.RefObject<mapboxgl.Map>,
    defaultConfig: MapboxStandardConfig
) {
    const [config, setConfig] = useState(defaultConfig);
    useChangeMapConfig(mapRef, config);
    return { config, setConfig };
}
