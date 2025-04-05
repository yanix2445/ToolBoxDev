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
              {/* Définition des dégradés pour les effets métalliques */}
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5d57a" />
                <stop offset="25%" stopColor="#e0a33b" />
                <stop offset="50%" stopColor="#fbe9a0" />
                <stop offset="75%" stopColor="#be7f16" />
                <stop offset="100%" stopColor="#d6a849" />
              </linearGradient>

              {/* Silver Gradient */}
              <linearGradient id="silver-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f2f2f2" />
                <stop offset="25%" stopColor="#a8a8a8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="75%" stopColor="#8c8c8c" />
                <stop offset="100%" stopColor="#c8c8c8" />
              </linearGradient>

              {/* Copper Gradient */}
              <linearGradient id="copper-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#db9562" />
                <stop offset="25%" stopColor="#9e5627" />
                <stop offset="50%" stopColor="#e6b188" />
                <stop offset="75%" stopColor="#8c480f" />
                <stop offset="100%" stopColor="#b76d3a" />
              </linearGradient>

              {/* Apple Icon Gradient */}
              <linearGradient id="icon-gradient-apple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#666666" />
                <stop offset="25%" stopColor="#444444" />
                <stop offset="50%" stopColor="#999999" />
                <stop offset="75%" stopColor="#333333" />
                <stop offset="100%" stopColor="#777777" />
              </linearGradient>

              {/* Windows Icon Gradient */}
              <linearGradient id="icon-gradient-windows" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0078d7" />
                <stop offset="25%" stopColor="#005a9e" />
                <stop offset="50%" stopColor="#00a2ff" />
                <stop offset="75%" stopColor="#00417a" />
                <stop offset="100%" stopColor="#0063b1" />
              </linearGradient>

              {/* Linux Icon Gradient */}
              <linearGradient id="icon-gradient-linux" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e67e22" />
                <stop offset="25%" stopColor="#d35400" />
                <stop offset="50%" stopColor="#f39c12" />
                <stop offset="75%" stopColor="#af5800" />
                <stop offset="100%" stopColor="#e78d4a" />
              </linearGradient>

              {/* Icons Gradient */}
              <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="30%" stopColor="hsl(var(--primary) / 0.7)" />
                <stop offset="70%" stopColor="hsl(var(--primary) / 0.9)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
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
