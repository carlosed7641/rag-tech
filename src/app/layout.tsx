import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RagTech — Tienda de electrónica",
  description:
    "Audio, cómputo, hogar inteligente, gaming y fotografía. Con hoja de especificaciones.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-body text-ink">
        {children}
      </body>
    </html>
  );
}
