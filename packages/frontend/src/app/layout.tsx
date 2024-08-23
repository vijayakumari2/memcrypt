import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryClient } from "@tanstack/react-query";

import { Inter as FontSans } from "next/font/google";
import Providers from "./provider";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
const queryClient = new QueryClient();
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MemCrypt",
  description: "MemCrypt - Advanced Ransomware protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
        style={{ backgroundColor: "#F7F9FC" }}
      >
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
