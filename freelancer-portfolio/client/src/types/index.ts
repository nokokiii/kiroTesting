export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  jobTitle?: string;
  bio?: string;
  profilePicture?: string;
  theme: 'LIGHT' | 'DARK';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  projectUrl?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  type: 'TEXT' | 'ICON';
  iconUrl?: string;
  displayOrder: number;
  createdAt: string;
}

export interface Experience {
  id: string;
  userId: string;
  type: 'WORK' | 'EDUCATION';
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  portfolioUserId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PortfolioView {
  id: string;
  portfolioUserId: string;
  viewerIp: string;
  userAgent?: string;
  referrer?: string;
  viewedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ThemeContextType {
  theme: 'LIGHT' | 'DARK';
  toggleTheme: () => void;
}