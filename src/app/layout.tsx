import type { Metadata } from "next";
import { Dancing_Script, Quicksand } from "next/font/google";
import Navigation from "@/components/navigation";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dancingScript.variable} ${quicksand.variable} font-sans`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
