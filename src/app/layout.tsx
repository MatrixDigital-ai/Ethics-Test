import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EthicsIQ — Employee Ethics Testing Platform",
  description: "AI-powered immersive platform for employee ethics assessment, analytics, and professional development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
