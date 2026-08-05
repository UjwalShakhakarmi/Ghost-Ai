import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Design systems at the speed of thought.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "var(--accent-primary)",
          colorBackground: "var(--bg-surface)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-surface border border-surface-border shadow-2xl rounded-2xl p-8 w-full max-w-md",
          headerTitle: "text-copy-primary font-bold text-xl text-center",
          headerSubtitle: "text-copy-muted text-sm text-center",
          socialButtonsBlockButton:
            "border border-surface-border bg-subtle text-copy-primary hover:bg-elevated rounded-xl h-11 font-medium",
          formButtonPrimary:
            "bg-brand text-bg-base hover:bg-brand/90 font-semibold rounded-xl h-11 text-sm tracking-wide transition-colors",
          footerActionLink: "text-brand hover:underline font-medium",
          formFieldInput:
            "bg-subtle border border-surface-border text-copy-primary focus:border-brand rounded-xl h-11 px-4 text-sm",
          formFieldLabel:
            "text-xs font-semibold text-copy-primary uppercase tracking-wider mb-1.5",
          dividerLine: "bg-surface-border",
          dividerText: "text-copy-faint text-xs uppercase tracking-widest",
          footer:
            "border-t border-surface-border bg-transparent text-xs text-copy-muted",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-base text-copy-primary">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
