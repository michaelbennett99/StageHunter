import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/header";


export const metadata: Metadata = {
  title: "StageHunter",
  description: "StageHunter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col h-dvh overflow-hidden antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
