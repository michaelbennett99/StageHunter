'use client';

import { useState } from 'react';

import Map from './map';
import Elevation from './elevation/elevation';
import { GradientData } from '@/api/types';

export default function Route({
  track,
  elevation
}: {
  track: GeoJSON.LineString;
  elevation: GradientData[];
}): JSX.Element {
  const [distance, setDistance] = useState<number | null>(null);

  return (
    <div
      className="flex flex-col flex-grow gap-2 my-2 ml-2"
      id="route-data-container"
    >
      <Map track={track} distance={distance} />
      <Elevation
        data={elevation}
        distance={distance}
        setDistance={setDistance}
      />
    </div>
  );
}
