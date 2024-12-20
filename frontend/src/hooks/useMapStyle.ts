import { useState } from "react";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import useChangeMapStyle from "@/hooks/useChangeMapStyle";

export default function useMapStyle(
    mapRef: React.RefObject<mapboxgl.Map>,
    defaultStyle: MapboxStyleId,
    config: MapboxStandardConfig
) {
    const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
    useChangeMapStyle(mapRef, selectedStyle, config);
    return { selectedStyle, setSelectedStyle };
}
