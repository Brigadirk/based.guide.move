"use client"

import {
  // Common UI Icons
  Loader2,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  
  // Navigation & Actions
  ArrowRight,
  Download,
  Share2,
  Copy,
  Search,
  Target,
  Globe,
  MapPin,
  Languages,
  
  // User & Personal
  User,
  Users,
  UserPlus,
  Heart,
  Baby,
  Pencil,
  CalendarDays,
  Home,
  
  // Education & Career
  GraduationCap,
  BookOpen,
  Award,
  Brain,
  School,
  Briefcase,
  
  // Finance & Money
  DollarSign,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Building,
  Wallet,
  
  // Travel & Location
  Plane,
  Shield,
  FileText,
  Clock,
  
  // Help & Information
  HelpCircle,
  Lightbulb,
  Zap,
  
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

// Common icon mappings for consistent usage across the app
export const Icons = {
  // Loading states
  spinner: Loader2,
  loading: Loader2,
  
  // Actions
  add: Plus,
  delete: Trash2,
  remove: Trash2,
  edit: Pencil,
  search: Search,
  download: Download,
  share: Share2,
  copy: Copy,
  close: X,
  
  // Status & Feedback
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  check: Check,
  error: AlertTriangle,
  
  // Navigation
  expand: ChevronDown,
  collapse: ChevronUp,
  dropdown: ChevronsUpDown,
  next: ArrowRight,
  
  // Personal & Family
  user: User,
  users: Users,
  addUser: UserPlus,
  family: Users,
  relationship: Heart,
  child: Baby,
  calendar: CalendarDays,
  home: Home,
  
  // Location & Travel
  globe: Globe,
  location: MapPin,
  destination: MapPin,
  travel: Plane,
  languages: Languages,
  visa: Shield,
  
  // Education & Career
  education: GraduationCap,
  degree: Award,
  book: BookOpen,
  skills: Brain,
  school: School,
  work: Briefcase,
  career: Briefcase,
  
  // Finance & Money
  money: DollarSign,
  income: DollarSign,
  investment: TrendingUp,
  savings: PiggyBank,
  pension: PiggyBank,
  credit: CreditCard,
  property: Building,
  business: Building,
  wallet: Wallet,
  
  // Documents & Legal
  document: FileText,
  certificate: FileText,
  time: Clock,
  
  // Help & Guidance
  help: HelpCircle,
  tip: Lightbulb,
  important: Zap,
  target: Target,
} as const

// Icon size variants for consistent sizing
export const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
} as const

// Helper function to get icon component
export const getIcon = (name: keyof typeof Icons) => {
  return Icons[name]
} 