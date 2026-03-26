import "./globals.css"
import Tabs from "@/components/Tabs"
import { AnalysisProvider } from "@/context/AnalysisContext"
import Script from "next/script"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-[#F9FAFB] text-[#111827]`}>

        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          strategy="beforeInteractive"
        />

        <AnalysisProvider>
          <div className="max-w-md mx-auto p-6">

            <Tabs />

            <div className="mt-6">
              {children}
            </div>

          </div>
        </AnalysisProvider>

      </body>
    </html>
  )
}