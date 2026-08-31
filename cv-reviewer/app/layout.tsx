import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOTC — CV Reviewer",
  description: "Review CV yang jujur, spesifik, dan berbasis bukti.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
