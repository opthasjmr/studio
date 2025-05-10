
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vision Care Plus",
  description: "Advanced Eye Health Care Software.",
  mainNav: [
    {
      title: "Home",
      href: "/",
      authRequired: false,
    },
    {
      title: "Features", // Example public page
      href: "/#features", // Link to features section on homepage
      authRequired: false,
    },
    {
      title: "Request Demo",
      href: "/contact",
      authRequired: false,
    },
  ],
  userNav: [ 
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard", 
      roles: ["admin", "doctor", "receptionist", "patient"],
    },
    {
      title: "Profile", 
      href: "/profile", 
      icon: "Users", // Placeholder for user icon
      roles: ["admin", "doctor", "receptionist", "patient"],
    },
    {
        title: "Request Demo",
        href: "/contact",
        icon: "Send", // Placeholder, lucide-react doesn't have 'Send' directly. Using a generic one.
        roles: ["admin", "doctor", "receptionist", "patient"],
    }
  ],
  sidebarNav: [ 
     {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard", 
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
      roles: ["admin", "doctor", "receptionist", "patient"], // Patients can view their own profile via a different route /profile, linked from header
    },
    {
      title: "Appointments",
      href: "/appointments", // Parent route
      icon: "CalendarDays",
      roles: ["admin", "doctor", "receptionist", "patient"],
      children: [
        { title: "View Calendar", href: "/appointments", icon: "CalendarDays", roles: ["admin", "doctor", "receptionist", "patient"] },
        { title: "Schedule New", href: "/appointments/new", icon: "CalendarPlus", roles: ["admin", "doctor", "receptionist"] },
        // Patient specific "My Appointments" can be a separate link or filtered view on /appointments
      ]
    },
    {
      title: "Analyze Scan",
      href: "/analyze-scan",
      icon: "ScanEye",
      roles: ["admin", "doctor"],
    },
     {
      title: "Research Assistant",
      href: "/research-assistant",
      icon: "Wand2", 
      roles: ["admin", "doctor"], 
    },
    {
      title: "AutoScholar Project", 
      href: "/project-autoscholar",
      icon: "FlaskConical", 
      roles: ["admin", "doctor"],
    },
    {
      title: "EMR",
      href: "/emr", // This could be a search/list page for doctors/admins
      icon: "FileText",
      roles: ["admin", "doctor"],
    },
    // Patient specific "My Medical Records" could link here or to a patient-specific EMR view
    {
      title: "Billing",
      href: "/billing",
      icon: "DollarSign",
      roles: ["admin", "receptionist", "patient"], // Patients can view their billing
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
      roles: ["admin"], // Typically admin only for system settings
    },
  ],
  links: {
    // Add external links if any
    // github: "https://github.com/example/visioncareplus",
  },
};
