import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumière — Salon Appointment System",
  description: "Premium salon booking and management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen overflow-x-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
