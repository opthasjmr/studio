
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
      authRequired: false,
    },
    // New pages for main navigation, can be added if they are public-facing
    // Example:
    // {
    //   title: "Features",
    //   href: "/features",
    // },
  ],
  userNav: [ // For logged-in users, typically in a user dropdown menu
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Profile", // Placeholder, can be built out later
      href: "/profile", // Assuming a /profile page will exist
    },
    {
        title: "Request Demo", // Still useful for logged-in users
        href: "/contact",
    }
  ],
  sidebarNav: [ // For logged-in users, main app navigation
     {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard", // Icon names from lucide-react
      roles: ["admin", "doctor", "receptionist", "patient"],
    },
    {
      title: "Reception Desk",
      href: "/reception/dashboard",
      icon: "ClipboardList",
      roles: ["receptionist", "admin"],
    },
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: "CalendarDays",
      roles: ["admin", "doctor", "receptionist", "patient"],
      children: [
        { title: "View All", href: "/appointments", icon: "CalendarDays", roles: ["admin", "doctor", "receptionist", "patient"] },
        { title: "Schedule New", href: "/appointments/new", icon: "CalendarPlus", roles: ["admin", "doctor", "receptionist"] },
      ]
    },
    {
      title: "Analyze Scan",
      href: "/analyze-scan",
      icon: "ScanEye",
      roles: ["admin", "doctor"],
    },
     {
      title: "Research Assistant", // New Feature
      href: "/research-assistant",
      icon: "Wand2", // Using Wand2 icon for AI Assistant
      roles: ["admin", "doctor"], // Primarily for doctors and researchers/admins
    },
    {
      title: "AutoScholar Project", // New Project Outline Page
      href: "/project-autoscholar",
      icon: "FlaskConical", // Icon for research project
      roles: ["admin", "doctor"],
    },
    {
      title: "EMR",
      href: "/emr",
      icon: "FileText",
      roles: ["admin", "doctor"],
    },
    {
      title: "Billing",
      href: "/billing",
      icon: "DollarSign",
      roles: ["admin", "receptionist"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: "BarChart2",
      roles: ["admin", "doctor"],
    },
    {
      title: "Telemedicine",
      href: "/telemedicine",
      icon: "Video",
      roles: ["admin", "doctor", "patient"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
      roles: ["admin"],
    },
  ],
  links: {
    // Add external links if any
  },
};