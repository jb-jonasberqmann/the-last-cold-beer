import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/hooks/useLanguage";

export const metadata: Metadata = {
  title: "The Last Cold Beer",
  description: "A 2-team mystery quest party game for cabin trips.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
