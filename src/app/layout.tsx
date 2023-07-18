import "bootstrap/dist/css/bootstrap.css";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Providers } from "./providers";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unlimited Storage 🔥",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
