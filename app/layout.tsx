import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiProviders } from "./lib/wagmi-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bonding Curve DApp",
  description: "A DApp for trading tokens with bonding curve pricing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProviders>
          {children}
        </WagmiProviders>
      </body>
    </html>
  );
}