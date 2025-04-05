import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '../components/theme-provider';

import { ThemeToggle } from './theme-toggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ToolBox - Détection OS',
  description: "Application de détection de système d'exploitation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <svg className="gradient-definitions">
            <defs>
              <linearGradient
                id="gold-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFF7D6" />
                <stop offset="25%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFBC00" />
                <stop offset="75%" stopColor="#E6A800" />
                <stop offset="100%" stopColor="#CC9200" />
              </linearGradient>

              <linearGradient
                id="silver-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E6E6E6" />
                <stop offset="50%" stopColor="#CCCCCC" />
                <stop offset="75%" stopColor="#B3B3B3" />
                <stop offset="100%" stopColor="#999999" />
              </linearGradient>

              <linearGradient
                id="copper-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFD7BE" />
                <stop offset="25%" stopColor="#E09C7E" />
                <stop offset="50%" stopColor="#B87333" />
                <stop offset="75%" stopColor="#9E5828" />
                <stop offset="100%" stopColor="#8A4513" />
              </linearGradient>

              <linearGradient
                id="icon-gradient-apple"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#555555" />
                <stop offset="50%" stopColor="#333333" />
                <stop offset="100%" stopColor="#222222" />
              </linearGradient>

              <linearGradient
                id="icon-gradient-windows"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#00ADEF" />
                <stop offset="50%" stopColor="#0078D7" />
                <stop offset="100%" stopColor="#0063B1" />
              </linearGradient>

              <linearGradient
                id="icon-gradient-linux"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFDD57" />
                <stop offset="50%" stopColor="#FCC624" />
                <stop offset="100%" stopColor="#E0A800" />
              </linearGradient>

              <linearGradient
                id="icon-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#CCCCCC" />
                <stop offset="100%" stopColor="#999999" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
