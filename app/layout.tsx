import { AuthProvider } from '../context/AuthContext';
import './globals.css';
import Navbar from './navbar'; // Import Navbar as a separate client component
import { Toaster } from '@/components/ui/sonner'; // Import the Sonner Toaster component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar /> {/* Navbar is now a client component */}
          <Toaster /> {/* Add the Sonner Toaster component here */}
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}