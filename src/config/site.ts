
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vision Care Plus",
  description: "Advanced Eye Health Care Software.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Analyze Scan",
      href: "/analyze-scan",
      authRequired: true, 
    },
    {
      title: "Request Demo",
      href: "/contact",
      authRequired: false, // Show if not logged in
    },
    // Add more navigation items here
  ],
  userNav: [ // For logged-in users, might be in a dropdown
    {
      title: "Profile",
      href: "/profile",
    },
    {
        title: "Request Demo",
        href: "/contact",
    }
  ],
  links: {
    // Add external links if any
  },
};
