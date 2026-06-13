//src/app/logout/page.jsx
'use client';
export const metadata = {
  title: "OSRA",
  description: "Online Student Record and Attendance Application",

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/images/osra-6.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}