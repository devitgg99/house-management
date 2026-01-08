"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "kh";

type TranslationKeys = {
  // Common
  dashboard: string;
  properties: string;
  tenants: string;
  payments: string;
  maintenance: string;
  documents: string;
  messages: string;
  notifications: string;
  settings: string;
  signOut: string;
  search: string;
  filter: string;
  all: string;
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirm: string;
  loading: string;
  noData: string;
  
  // Portal titles
  adminPanel: string;
  ownerPortal: string;
  renterPortal: string;
  
  // Properties
  myProperties: string;
  addProperty: string;
  editProperty: string;
  deleteProperty: string;
  propertyName: string;
  propertyAddress: string;
  totalRooms: string;
  occupiedRooms: string;
  vacantRooms: string;
  
  // Floors
  floors: string;
  addFloor: string;
  floorName: string;
  floorNumber: string;
  
  // Rooms
  rooms: string;
  addRoom: string;
  editRoom: string;
  deleteRoom: string;
  roomName: string;
  roomPrice: string;
  available: string;
  occupied: string;
  assignRenter: string;
  
  // Utilities
  utilities: string;
  utilityReport: string;
  addUtility: string;
  waterUsage: string;
  oldWater: string;
  newWater: string;
  waterCost: string;
  roomCost: string;
  totalCost: string;
  month: string;
  paid: string;
  unpaid: string;
  markAsPaid: string;
  markAsUnpaid: string;
  exportPdf: string;
  
  // Users
  users: string;
  renters: string;
  owners: string;
  follow: string;
  unfollow: string;
  following: string;
  
  // Other
  myRental: string;
  reports: string;
  rolesPermissions: string;
  systemSettings: string;
  language: string;
  english: string;
  khmer: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Common
    dashboard: "Dashboard",
    properties: "Properties",
    tenants: "Tenants",
    payments: "Payments",
    maintenance: "Maintenance",
    documents: "Documents",
    messages: "Messages",
    notifications: "Notifications",
    settings: "Settings",
    signOut: "Sign out",
    search: "Search",
    filter: "Filter",
    all: "All",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    noData: "No data available",
    
    // Portal titles
    adminPanel: "Admin Panel",
    ownerPortal: "Owner Portal",
    renterPortal: "Renter Portal",
    
    // Properties
    myProperties: "My Properties",
    addProperty: "Add Property",
    editProperty: "Edit Property",
    deleteProperty: "Delete Property",
    propertyName: "Property Name",
    propertyAddress: "Property Address",
    totalRooms: "Total Rooms",
    occupiedRooms: "Occupied Rooms",
    vacantRooms: "Vacant Rooms",
    
    // Floors
    floors: "Floors",
    addFloor: "Add Floor",
    floorName: "Floor Name",
    floorNumber: "Floor Number",
    
    // Rooms
    rooms: "Rooms",
    addRoom: "Add Room",
    editRoom: "Edit Room",
    deleteRoom: "Delete Room",
    roomName: "Room Name",
    roomPrice: "Room Price",
    available: "Available",
    occupied: "Occupied",
    assignRenter: "Assign Renter",
    
    // Utilities
    utilities: "Utilities",
    utilityReport: "Utility Report",
    addUtility: "Add Utility",
    waterUsage: "Water Usage",
    oldWater: "Previous Reading",
    newWater: "Current Reading",
    waterCost: "Water Cost",
    roomCost: "Room Cost",
    totalCost: "Total Cost",
    month: "Month",
    paid: "Paid",
    unpaid: "Unpaid",
    markAsPaid: "Mark as Paid",
    markAsUnpaid: "Mark as Unpaid",
    exportPdf: "Export PDF",
    
    // Users
    users: "Users",
    renters: "Renters",
    owners: "Owners",
    follow: "Follow",
    unfollow: "Unfollow",
    following: "Following",
    
    // Other
    myRental: "My Rental",
    reports: "Reports",
    rolesPermissions: "Roles & Permissions",
    systemSettings: "System Settings",
    language: "Language",
    english: "English",
    khmer: "ខ្មែរ",
  },
  kh: {
    // Common
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    properties: "អចលនទ្រព្យ",
    tenants: "អ្នកជួល",
    payments: "ការទូទាត់",
    maintenance: "ការថែទាំ",
    documents: "ឯកសារ",
    messages: "សារ",
    notifications: "ការជូនដំណឹង",
    settings: "ការកំណត់",
    signOut: "ចាកចេញ",
    search: "ស្វែងរក",
    filter: "ច្រោះ",
    all: "ទាំងអស់",
    add: "បន្ថែម",
    edit: "កែសម្រួល",
    delete: "លុប",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    confirm: "បញ្ជាក់",
    loading: "កំពុងផ្ទុក...",
    noData: "គ្មានទិន្នន័យ",
    
    // Portal titles
    adminPanel: "ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល",
    ownerPortal: "ច្រកចូលម្ចាស់ផ្ទះ",
    renterPortal: "ច្រកចូលអ្នកជួល",
    
    // Properties
    myProperties: "អចលនទ្រព្យរបស់ខ្ញុំ",
    addProperty: "បន្ថែមអចលនទ្រព្យ",
    editProperty: "កែអចលនទ្រព្យ",
    deleteProperty: "លុបអចលនទ្រព្យ",
    propertyName: "ឈ្មោះអចលនទ្រព្យ",
    propertyAddress: "អាសយដ្ឋាន",
    totalRooms: "បន្ទប់សរុប",
    occupiedRooms: "បន្ទប់មានអ្នកជួល",
    vacantRooms: "បន្ទប់ទំនេរ",
    
    // Floors
    floors: "ជាន់",
    addFloor: "បន្ថែមជាន់",
    floorName: "ឈ្មោះជាន់",
    floorNumber: "លេខជាន់",
    
    // Rooms
    rooms: "បន្ទប់",
    addRoom: "បន្ថែមបន្ទប់",
    editRoom: "កែបន្ទប់",
    deleteRoom: "លុបបន្ទប់",
    roomName: "ឈ្មោះបន្ទប់",
    roomPrice: "តម្លៃបន្ទប់",
    available: "ទំនេរ",
    occupied: "មានអ្នកជួល",
    assignRenter: "កំណត់អ្នកជួល",
    
    // Utilities
    utilities: "ឧបករណ៍ប្រើប្រាស់",
    utilityReport: "របាយការណ៍ប្រើប្រាស់",
    addUtility: "បន្ថែមការប្រើប្រាស់",
    waterUsage: "ការប្រើប្រាស់ទឹក",
    oldWater: "អំណានមុន",
    newWater: "អំណានថ្មី",
    waterCost: "តម្លៃទឹក",
    roomCost: "តម្លៃបន្ទប់",
    totalCost: "តម្លៃសរុប",
    month: "ខែ",
    paid: "បានបង់",
    unpaid: "មិនទាន់បង់",
    markAsPaid: "កំណត់ថាបានបង់",
    markAsUnpaid: "កំណត់ថាមិនទាន់បង់",
    exportPdf: "នាំចេញ PDF",
    
    // Users
    users: "អ្នកប្រើប្រាស់",
    renters: "អ្នកជួល",
    owners: "ម្ចាស់ផ្ទះ",
    follow: "តាមដាន",
    unfollow: "ឈប់តាមដាន",
    following: "កំពុងតាមដាន",
    
    // Other
    myRental: "ការជួលរបស់ខ្ញុំ",
    reports: "របាយការណ៍",
    rolesPermissions: "តួនាទី និងការអនុញ្ញាត",
    systemSettings: "ការកំណត់ប្រព័ន្ធ",
    language: "ភាសា",
    english: "English",
    khmer: "ខ្មែរ",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
};

// Default context value for SSR
const defaultContextValue: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: translations["en"],
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "kh")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = translations[language];

  // Always provide context, use default English for SSR
  const value = mounted 
    ? { language, setLanguage, t }
    : defaultContextValue;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

