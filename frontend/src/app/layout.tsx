import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import Header from "@/components/layout/header";
import { HeaderInfoProvider } from "@/context/headerInfoContext";

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
    <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col h-dvh overflow-hidden antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HeaderInfoProvider>
              <Header />
              {children}
            </HeaderInfoProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
