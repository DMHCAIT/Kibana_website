import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Providers } from "./providers";
import { AuthModal } from "@/components/auth/auth-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Kibana — Pure. Minimal. Luxe.",
  description:
    "Premium vegan-leather handbags, totes, slings and backpacks. Hand-finished, every day.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Providers>
          <Header />
          <AuthModal />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <MobileBottomNav />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
