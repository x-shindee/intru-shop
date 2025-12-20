import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intru - Indian Streetwear Brand",
  description: "Premium streetwear made in India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="bg-black text-white py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Intru</h3>
                <p className="text-gray-400 text-sm">
                  Premium Indian streetwear
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="text-orange-500">🇮🇳</span> Made in India
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Policies</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Exchanges Only (36-hour window)</li>
                  <li>Free Shipping on Prepaid Orders</li>
                  <li>COD Available</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Email: support@intru.in</li>
                  <li>Phone: +91XXXXXXXXXX</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Grievance Officer</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Name: Officer Name</li>
                  <li>Email: grievance@intru.in</li>
                  <li>Phone: +91XXXXXXXXXX</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Intru. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
