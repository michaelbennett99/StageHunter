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
        <body className="flex flex-col h-dvh overflow-hidden antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
          </ThemeProvider>
        </body>
    </html>
  );
}
