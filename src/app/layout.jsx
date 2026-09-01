import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import CommandPalette from "../components/common/CommandPalette";
import { ThemeProvider } from "../context/ThemeContext";
import { FavoritesProvider } from "../context/FavoritesContext";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://devutilix.com"),
  title: {
    default: "DevutiliX - 71+ Essential Developer Tools & Utilities",
    template: "%s | DevutiliX",
  },
  description:
    "Fast, privacy-focused collection of 71+ developer utilities including JSON formatters, base64 encoders, hash generators, image resizers, QR code generators, and more. 100% client-side.",
  keywords: [
    "developer tools",
    "json formatter",
    "base64 encoder",
    "hash generator",
    "image converter",
    "qr code generator",
    "password generator",
    "uuid generator",
    "css tools",
    "regex tester",
    "sql formatter",
    "text diff checker",
  ],
  authors: [{ name: "Nirdhum", url: "https://nirdhum.in" }],
  creator: "Nirdhum - Veridicus Lab",
  icons: {
    icon: "/devutilix_favicon.png",
    shortcut: "/devutilix_favicon.png",
    apple: "/devutilix_favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devutilix.com",
    siteName: "DevutiliX",
    title: "DevutiliX - Free Developer Utilities & Tools",
    description:
      "Fast, privacy-focused developer utilities running 100% locally in your browser. No server tracking or data storage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevutiliX - Free Developer Utilities & Tools",
    description:
      "32+ modern developer tools: converters, encoders, formatters, and generators right in your browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col antialiased">
        <ThemeProvider>
          <FavoritesProvider>
            <Header />
            <div className="flex-1 flex flex-col pt-16">
              {children}
            </div>
            <Footer />
            <CommandPalette />
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
