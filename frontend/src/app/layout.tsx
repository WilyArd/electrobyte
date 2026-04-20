import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ElectroByte — Next-Gen Electronics & IT Hardware",
  description:
    "Shop the latest laptops, desktops, peripherals, components, and accessories at ElectroByte. Premium electronics with fast shipping and expert support.",
  keywords: [
    "electronics",
    "laptops",
    "gaming PC",
    "peripherals",
    "computer components",
    "IT hardware",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
