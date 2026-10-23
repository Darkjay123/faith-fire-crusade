import "./globals.css";

export const metadata = {
  title: "Faith & Fire Crusade '26 — DELSU Prays | The Watchmen Prayer Network Int'l",
  description:
    "The 9th edition of the Faith & Fire Crusade, DELSU Prays. December 6th to 8th, 2026, 4:30 PM daily at the Crusade Ground, Abraka, Delta State. Free entry.",
  themeColor: "#0e0602",
  openGraph: {
    title: "Faith & Fire Crusade '26 — DELSU Prays",
    description: "The 9th edition. December 6th to 8th, 2026. 4:30 PM daily. Abraka, Delta State.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
