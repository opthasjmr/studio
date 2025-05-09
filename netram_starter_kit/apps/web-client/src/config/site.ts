
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vision Care Plus Web Client",
  description:
    "Web application for the Vision Care Plus Eye Health Platform.",
  mainNav: [ // Example for header navigation
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      authRequired: true, // Example property
    },
  ],
  sidebarNav: [ // Example for sidebar navigation within authenticated areas
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard", // Placeholder for icon component or name
      roles: ["admin", "doctor", "receptionist", "patient"],
    },
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
      roles: ["admin", "doctor", "receptionist"],
    },
    // Add more sidebar items based on the framework
  ],
  links: {
    // twitter: "https://twitter.com/example",
    github: "https://github.com/example/visioncareplus",
  },
};

