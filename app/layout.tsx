import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SessionProvider } from "next-auth/react"
import {Sidebar} from "@/app/_components/Sidebar";
import {NavHeader} from "@/app/_components/NavHeader";

export const metadata: Metadata = {
  title: "Brainzrr",
  description: "Une application de musique style Spotify utilisant MusicBrainz",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Brainzrr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="bg-black text-white overflow-hidden h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <SessionProvider>
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
                <Sidebar className="order-last lg:order-first" />
                <main className="flex-1 bg-zinc-900 lg:rounded-lg lg:my-2 lg:mr-2 overflow-y-auto relative min-h-0">
                  <div className="absolute inset-0 bg-linear-to-b from-zinc-800/50 to-zinc-900 pointer-events-none h-64" />
                  <NavHeader />
                  <div className="relative z-10 p-4 lg:p-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <ServiceWorkerRegistration />
        </SessionProvider>
      </body>
    </html>
  );
}

function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
              });
            });
          }
        `,
      }}
    />
  );
}
