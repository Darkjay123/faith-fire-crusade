// Faith & Fire Crusade '26 — single source of truth for event content.
// Organizers: edit values here only; every section of the site reads from this file.
export const SITE = {
  url: "https://faith-fire-crusade.vercel.app",
  name: "Faith & Fire Crusade '26",
  edition: "The 9th Edition",
  org: "The Watchmen Prayer Network Int'l",
  tagline: "Raising a people of the Word, the Spirit, and Prayer",
  pastor: "Pastor Ikechukwuka Jerry Ubabudike",
  telegram: "https://t.me/thewatchmenprayernetworkintl",
  // Days are UTC instants built from Lagos wall-clock times (+01:00), so the
  // countdown and event states stay correct on any device in any timezone.
  days: [
    { label: "Sunday", short: "Sun 6 Dec", full: "Sunday, December 6, 2026", start: "2026-12-06T16:30:00+01:00", title: "Opening Night" },
    { label: "Monday", short: "Mon 7 Dec", full: "Monday, December 7, 2026", start: "2026-12-07T16:30:00+01:00", title: "The Fire Altars" },
    { label: "Tuesday", short: "Tue 8 Dec", full: "Tuesday, December 8, 2026", start: "2026-12-08T16:30:00+01:00", title: "Commissioning" },
  ],
  eventEnd: "2026-12-09T00:30:00+01:00",
  venue: {
    lines: [
      "Crusade Ground",
      "opposite Gospel Stars Church",
      "off Olori 19 Road, behind Ese-G Hostel",
      "Abraka, Delta State, Nigeria",
    ],
    landmarks: ["Gospel Stars Church", "Ese-G Hostel", "Olori 19 Road", "Abraka"],
    // Text-address map search. Replace with exact coordinates once verified on site.
    mapQuery: "Crusade Ground, off Olori 19 Road, behind Ese-G Hostel, Abraka, Delta State, Nigeria",
  },
  enquiries: ["0703 534 4774", "0704 781 8950"],
  // Prayer requests are delivered to the prayer team on WhatsApp.
  // Nothing is stored on this website. Edit here if the number changes.
  prayerWhatsApp: "2347035344774",
  // Livestream: leave null until a verified broadcast URL exists.
  // When set to a YouTube watch URL, the live section embeds it automatically.
  streamUrl: null,
  // Official announcements shown in the updates section (newest first). Empty = hidden.
  announcements: [],
  ogImage: "/img/flyer_og.jpg",
};
