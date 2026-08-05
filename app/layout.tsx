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
  title: "ghost Al",
  description: "Visual AI Architecture Canvas",
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
        elements: {
          card: "bg-surface border border-surface-border shadow-2xl rounded-2xl",
          headerTitle: "text-copy-primary font-bold",
          headerSubtitle: "text-copy-muted",
          socialButtonsBlockButton:
            "border border-surface-border bg-subtle text-copy-primary hover:bg-elevated",
          formButtonPrimary:
            "bg-brand text-bg-base hover:bg-brand/90 font-medium rounded-xl",
          footerActionLink: "text-brand hover:text-brand/90",
          formFieldInput:
            "bg-subtle border border-surface-border text-copy-primary focus:border-brand rounded-xl",
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
