import { AuthProvider } from '../context/AuthContext';
import './globals.css';
import Navbar from './navbar'; // Import Navbar as a separate client component

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
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}