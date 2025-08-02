// Global Statistics Configuration for RoomRento
// This file ensures consistent data across all components

export const SITE_STATISTICS = {
  // Main metrics displayed on homepage
  TOTAL_PROPERTIES: "1500+",
  HAPPY_CUSTOMERS: "800+", 
  CITIES_COVERED: "75+",
  CUSTOMER_SUPPORT: "24/7",
  
  // Additional metrics for different sections
  ACTIVE_LISTINGS: "1500+",
  EXPERT_AGENTS: "120+",
  SUCCESS_RATE: "98%",
  VERIFIED_PROPERTIES: "1500+",
  
  // Labels for consistency
  LABELS: {
    PROPERTIES: "Properties",
    HAPPY_CUSTOMERS: "Happy Customers",
    CITIES: "Cities",
    CITIES_COVERED: "Cities Covered",
    CUSTOMER_SUPPORT: "Customer Support",
    ACTIVE_LISTINGS: "Active Listings",
    EXPERT_AGENTS: "Expert Agents",
    SUCCESS_RATE: "Success Rate",
    VERIFIED_PROPERTIES: "Verified Properties"
  }
};

// Structured data for components that need array format
export const STATS_ARRAY = [
  { 
    number: SITE_STATISTICS.HAPPY_CUSTOMERS, 
    label: SITE_STATISTICS.LABELS.HAPPY_CUSTOMERS 
  },
  { 
    number: SITE_STATISTICS.VERIFIED_PROPERTIES, 
    label: SITE_STATISTICS.LABELS.VERIFIED_PROPERTIES 
  },
  { 
    number: SITE_STATISTICS.CITIES_COVERED, 
    label: SITE_STATISTICS.LABELS.CITIES_COVERED 
  },
  { 
    number: SITE_STATISTICS.CUSTOMER_SUPPORT, 
    label: SITE_STATISTICS.LABELS.CUSTOMER_SUPPORT 
  }
];

export default SITE_STATISTICS;
