import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Papai Professor 🎮",
  description: "Ensine seu filho com superpoderes! Aprenda junto, jogue junto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col scanlines">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
