import './globals.css';
import Nav from '@/components/Nav';

export const metadata = { title: 'PaceMate', description: 'Find running buddies at your pace' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body><Nav /><main>{children}</main></body>
    </html>
  );
}
