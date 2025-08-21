import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PersistenceProvider } from "@/components/providers/persistence-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mr Pro Bonobo's Ape Escape Consultancy - Migration Questionnaire",
  description: "Comprehensive migration questionnaire from Mr Pro Bonobo's Ape Escape Consultancy to help you find the best destination for your personal and financial situation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <PersistenceProvider>
            {children}
          </PersistenceProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 