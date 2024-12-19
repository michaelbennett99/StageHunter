import { useState, useEffect } from 'react';
import { LuSettings } from 'react-icons/lu';

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import {
  MapboxStandardConfig,
  MapboxStandardConfigKey
} from '@/interfaces/mapboxStandardConfig';

import MapButton, { MapButtonProps } from './mapButton';

export type MapConfigButtonProps = {
  defaultConfig: MapboxStandardConfig;
  mapRef: React.RefObject<mapboxgl.Map>;
} & MapButtonProps;

export default function MapConfigButton(
  { mapRef, defaultConfig, ...buttonProps }: MapConfigButtonProps
): JSX.Element {
  const [config, setConfig] = useState(defaultConfig);

  function handleConfigChange(
    key: MapboxStandardConfigKey,
    value: any
  ) {
    setConfig(
      prevConfig => ({
        ...prevConfig,
        [key]: { ...prevConfig[key], value }
      })
    );
  }

  useEffect(() => {
    const configObj = Object.fromEntries(
      Object.entries(config).map(([key, value]) => {
        return [key, value.value];
      })
    );

    console.log(configObj);

    mapRef.current?.setConfig('basemap', configObj);
  }, [config]);

  return (
    <MapButton
      {...buttonProps}
      asChild
    >
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 rounded-md shadow-md bg-background">
            <LuSettings />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            {Object.entries(config).map(([key, item]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm">{item.label}</span>
                {item.type === 'boolean' ? (
                  <Switch
                    checked={item.value}
                    onCheckedChange={() => handleConfigChange(
                      key as MapboxStandardConfigKey,
                      !item.value
                    )}
                  />
                ) : (
                  <Select
                    value={item.value}
                    onValueChange={(value) => handleConfigChange(
                      key as MapboxStandardConfigKey,
                      value
                    )}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {item.options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </MapButton>
  );
}
