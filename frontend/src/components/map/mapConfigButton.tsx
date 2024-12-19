import { useState } from 'react';
import { LuSettings } from 'react-icons/lu';

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';

import {
  MapboxStandardConfig,
  MapboxStandardConfigKey
} from '@/interfaces/mapboxStandardConfig';

import MapButton, { MapButtonProps } from './mapButton';

export type MapConfigButtonProps = {
  defaultConfig: MapboxStandardConfig;
} & MapButtonProps;

export default function MapConfigButton(
  { defaultConfig, ...buttonProps }: MapConfigButtonProps
): JSX.Element {
  const [config, setConfig] = useState(defaultConfig);

  console.log(config);

  function handleConfigChange(
    key: MapboxStandardConfigKey,
    value: typeof config[MapboxStandardConfigKey]
  ) {
    setConfig(
      prevConfig => ({
        ...prevConfig,
        [key]: { ...prevConfig[key], value }
      })
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <MapButton {...buttonProps}>
          <LuSettings />
        </MapButton>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <p>{value.label}</p>
              <p>{value.value}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
