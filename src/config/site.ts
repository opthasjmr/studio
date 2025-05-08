export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Netram Vision",
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
    // Add more navigation items here
  ],
  userNav: [
    {
      title: "Profile",
      href: "/profile",
    },
  ],
  links: {
    // Add external links if any
  },
};
