import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Data Dashboard",
  description: "Modern Environmental Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
