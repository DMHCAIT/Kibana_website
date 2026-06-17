import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { getSiteConfig } from "@/lib/server-data";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CookiesBanner } from "@/components/layout/cookies-banner";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { Providers } from "./providers";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthAutoPopup } from "@/components/auth/auth-auto-popup";

const canela = localFont({
  src: [
    {
      path: "../../public/Canela Deck Family/CanelaDeck-Light-Trial.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/Canela Deck Family/CanelaDeck-Regular-Trial.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Canela Deck Family/CanelaDeck-Medium-Trial.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/Canela Deck Family/CanelaDeck-Bold-Trial.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-canela",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../../public/poppins/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kibana — Pure. Minimal. Luxe.",
  description:
    "Premium vegan-leather handbags, totes, slings and backpacks. Hand-finished, every day.",
  icons: {
    icon: "/favicon-16x16.png",
    shortcut: "/favicon-16x16.png",
    apple: "/favicon-16x16.png",
  },
  openGraph: {
    title: "Kibana — Pure. Minimal. Luxe.",
    description: "Premium vegan-leather handbags.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6EFE5",
  width: "device-width",
  initialScale: 1,
};

const FALLBACK_CONFIG = { announcementBar: "" };

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pre-fetch site config during SSR (cached for performance)
  await withTimeout(
    getSiteConfig().catch(() => FALLBACK_CONFIG),
    2000,
    FALLBACK_CONFIG,
  );
  return (
    <html lang="en" className={`${canela.variable} ${poppins.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <Header />
          <AuthModal />
          <AuthAutoPopup />
          <CookiesBanner />
          <WhatsAppButton />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <MobileBottomNav />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
