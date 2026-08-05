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
  title: "Ghost AI - Sign In",
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
          colorPrimary: "#00d8d6",
          colorBackground: "#111116",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#111116] border border-[#1e1e28] shadow-2xl rounded-2xl p-8 w-full max-w-md",
          headerTitle: "text-white font-bold text-xl text-center",
          headerSubtitle: "text-[#808090] text-sm text-center",
          socialButtonsBlockButton:
            "border border-[#262636] bg-[#161620] text-white hover:bg-[#1f1f2e] rounded-xl h-11 font-medium",
          formButtonPrimary:
            "bg-[#00d8d6] text-black hover:bg-[#00c2c0] font-semibold rounded-xl h-11 text-sm tracking-wide transition-colors",
          footerActionLink: "text-[#00d8d6] hover:underline font-medium",
          formFieldInput:
            "bg-[#181822] border border-[#262636] text-white focus:border-[#00d8d6] rounded-xl h-11 px-4 text-sm",
          formFieldLabel: "text-xs font-semibold text-white uppercase tracking-wider mb-1.5",
          dividerLine: "bg-[#20202d]",
          dividerText: "text-[#606070] text-xs uppercase tracking-widest",
          footer: "border-t border-[#1a1a24] bg-transparent text-xs text-[#707080]",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-[#0a0a0c] text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
