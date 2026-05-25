import "./globals.css";
import { Mulish } from "next/font/google";
import { Providers } from "./providers";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata = {
  title: "Abbey Network",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main
            className={` ${mulish.className} min-h-screen bg-brand-light-grey text-brand-grey`}
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
