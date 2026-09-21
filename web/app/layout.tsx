import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Syne } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { FloorRuntime } from "@/components/floor-runtime";
import { WalletModal } from "@/components/wallet-modal";
import { StoreProvider } from "@/lib/store";
import { WalletProviders } from "@/components/wallet-providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Agent Desk",
    template: "%s · Agent Desk",
  },
  description:
    "Your agents. One desk. Assign work, watch live activity, approve what matters.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon-180.png",
  },
  openGraph: {
    title: "Agent Desk",
    description: "Your agents. One desk.",
    images: ["/og-promo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <WalletProviders>
          <StoreProvider>
            <FloorRuntime />
            <AppShell>{children}</AppShell>
            <WalletModal />
          </StoreProvider>
        </WalletProviders>
      </body>
    </html>
  );
}
