import type { Metadata } from "next";
import { Dancing_Script, Quicksand } from "next/font/google";
import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Star or Swipe 💝",
  description: "Find your next favorite GitHub repository with a Valentine's twist!",
  metadataBase: new URL('https://sos-github.vercel.app'),
  icons: {
    icon: [
      {
        url: '/purplegithub.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/purplegithub.png',
        sizes: '16x16',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/purplegithub.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
    shortcut: '/purplegithub.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Star or Swipe 💝",
    description: "Find your next favorite GitHub repository with a Valentine's twist!",
    url: 'https://sos-github.vercel.app',
    siteName: 'Star or Swipe',
    images: [
      {
        url: '/purplegithub.png',
        width: 800,
        height: 800,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Star or Swipe 💝",
    description: "Find your next favorite GitHub repository with a Valentine's twist!",
    images: ['/purplegithub.png'],
  },
  appleWebApp: {
    capable: true,
    title: "Star or Swipe",
    statusBarStyle: "default",
    startupImage: [
      {
        url: "/purplegithub.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dancingScript.variable} ${quicksand.variable} font-sans`}>
        <AuthProvider>
          <TopNav />
          <div className="pt-16">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
