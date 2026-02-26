import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TestIQ — AI-Powered Test Taking Platform",
  description: "Create, manage, and take AI-generated tests with instant scoring, detailed analytics, and downloadable PDF reports.",
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
