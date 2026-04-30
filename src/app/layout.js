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
  description: "Cari topik, dalil, dan kajian islami dari koleksi brosur Majlis Tafsir Al-Qur'an (MTA) secara instan. Lebih dari 13.000 dokumen tersedia.",
  keywords: ["Brosur MTA", "Kajian MTA", "Tafsir Al-Qur'an", "MTA Solo", "Dalil", "Pencarian Brosur", "Islam"],
  authors: [{ name: "Brosur MTA" }],
  creator: "Brosur MTA",
  publisher: "Brosur MTA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Pencarian Brosur MTA | Mesin Cari Kajian & Dalil",
    description: "Cari topik, dalil, dan kajian islami dari koleksi brosur Majlis Tafsir Al-Qur'an (MTA) secara instan.",
    url: 'https://brosur-mta.vercel.app',
    siteName: 'Pencarian Brosur MTA',
    locale: 'id_ID',
    type: 'website',
  },
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
