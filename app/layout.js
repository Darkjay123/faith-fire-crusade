import "./globals.css";
import { SITE } from "../lib/config";

const og = SITE.url + SITE.ogImage;

export const viewport = { themeColor: "#100707" };

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name + " — DELSU Prays | " + SITE.org,
  description:
    "The 9th edition of the Faith & Fire Crusade, DELSU Prays. December 6 to 8, 2026, 4:30 PM daily at the Crusade Ground, Abraka, Delta State. Free entry.",
  alternates: { canonical: SITE.url },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: SITE.name + " — DELSU Prays",
    description: "The 9th edition · December 6 to 8, 2026 · 4:30 PM daily · Abraka, Delta State · Free entry",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: [{ url: og, width: 2048, height: 2560, alt: "Faith & Fire Crusade 2026 official flyer" }],
  },
  twitter: { card: "summary_large_image", images: [og] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Faith & Fire Crusade 2026 — DELSU Prays",
  startDate: "2026-12-06T16:30:00+01:00",
  endDate: "2026-12-08T23:59:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  isAccessibleForFree: true,
  image: [og],
  description: "The 9th edition. Three nights, 4:30 PM daily.",
  location: {
    "@type": "Place",
    name: "Crusade Ground, Abraka",
    address: {
      "@type": "PostalAddress",
      streetAddress: "opposite Gospel Stars Church, off Olori 19 Road, behind Ese-G Hostel",
      addressLocality: "Abraka",
      addressRegion: "Delta State",
      addressCountry: "NG",
    },
  },
  organizer: { "@type": "Organization", name: SITE.org, url: SITE.telegram },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
