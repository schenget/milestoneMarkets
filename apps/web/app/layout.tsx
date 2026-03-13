import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Nav from "./components/Nav";
import "./styles.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL("https://milestonemarkets.example"),
  title: "Milestone Markets | Investment Insights Across Africa",
  description:
    "Multi-channel stock insights, buy/sell/hold signals, and simulation tools built for WhatsApp, USSD, SMS and low-bandwidth web.",
  openGraph: {
    title: "Milestone Markets",
    description: "Investment intelligence by Milestonecraft Investments",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
