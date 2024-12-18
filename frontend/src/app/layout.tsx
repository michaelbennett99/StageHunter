import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <body className="flex flex-col h-dvh overflow-hidden antialiased">
          <Header />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
