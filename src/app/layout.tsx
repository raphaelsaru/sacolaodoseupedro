import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/ui/sonner";

// Premium body font - clean, modern, excellent readability
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Display font - distinctive, characterful for headings
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Monospace font - for prices and technical elements
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sacolao do Seu Pedro | Frutas, Verduras e Legumes Frescos",
  description: "O melhor sacolao online de Brasilia. Frutas, verduras e legumes frescos entregues na sua casa. Qualidade garantida pelo Seu Pedro.",
  keywords: ["sacolao", "frutas", "verduras", "legumes", "delivery", "brasilia", "hortifruti"],
  authors: [{ name: "Sacolao do Seu Pedro" }],
  openGraph: {
    title: "Sacolao do Seu Pedro",
    description: "Frutas, verduras e legumes frescos entregues na sua casa",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${plusJakarta.variable} ${bricolage.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <CartProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
