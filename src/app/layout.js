import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pencarian Brosur MTA | Mesin Cari Kajian & Dalil",
  description: "Cari topik, dalil, dan kajian islami dari koleksi brosur Majlis Tafsir Al-Qur'an (MTA) secara instan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
