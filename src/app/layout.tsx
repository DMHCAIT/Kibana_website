import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
  metadataBase: new URL("https://kibanaindia.com"),
  title: "Kibana — Pure. Minimal. Luxe.",
  description:
    "Premium vegan-leather handbags, totes, slings and backpacks. Hand-finished, every day.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
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
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {GTM_ID ? (
          <>
            <Script id="gtm-loader" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        {/* Meta Pixel Script */}
        {META_PIXEL_ID ? (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
            >
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt="Meta Pixel"
              />
            </noscript>
          </>
        ) : null}
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
