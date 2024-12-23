"use client";

import { createContext, useContext, useState, useEffect } from "react";

type HeaderInfoContextType = {
  headerInfo: string;
  setHeaderInfo: (headerInfo: string) => void;
}

export const HeaderInfoContext = createContext<HeaderInfoContextType>({
  headerInfo: "",
  setHeaderInfo: () => {}
});

export function HeaderInfoProvider(
  { children }: { children: React.ReactNode }
): JSX.Element {
  const [headerInfo, setHeaderInfo] = useState("");

  return (
    <HeaderInfoContext.Provider value={{ headerInfo, setHeaderInfo }}>
      {children}
    </HeaderInfoContext.Provider>
  );
}

export function useHeaderInfo(): HeaderInfoContextType {
  return useContext(HeaderInfoContext);
}

export function HeaderInfoSetter(
  { headerInfo }: { headerInfo: string }
): JSX.Element {
  const { setHeaderInfo } = useHeaderInfo();

  useEffect(() => {
    setHeaderInfo(headerInfo);
  }, [headerInfo]);

  return <></>;
}
