import { ReactElement } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: ReactElement;
}>) {
  return <>{children}</>;
}
