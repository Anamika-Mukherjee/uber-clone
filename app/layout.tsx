import GoogleMapsWrapper from "@/components/GoogleMapsWrapper";
import ClientLayout from "@/components/ClientLayout";
import ClientServiceWorker from "@/components/ClientServiceWorker";
import type { Metadata } from "next";
import {Poppins, Jura} from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import Head from "next/head";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const jura = Jura({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "RideEazy",
  description: "The fastest transit for you!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

      const localization = {
            signIn: {
                start: {
                    title: "Sign In"
                }
            },
            signUp: {
                start: {
                    title: "Sign Up to RideEazy"
                }
            }
      };     
     
      return (
        <ClerkProvider localization = {localization}>
          <html lang="en">
          <Head>
              <link rel="icon" href="/favicon.ico" />
          </Head>
            <body
              className={`${poppins.className} antialiased w-screen overflow-x-hidden overflow-y-auto bg-gray-200 py-2`}
            >
              <ClientServiceWorker />
                  <ClientLayout>
                    <GoogleMapsWrapper>
                      {children}
                    </GoogleMapsWrapper>
                  </ClientLayout>
            </body>
          </html>
        </ClerkProvider>
      );
}
