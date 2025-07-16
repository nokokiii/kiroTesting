export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name?: string;
  jobTitle?: string;
  bio?: string;
  profilePicture?: string;
  theme: 'LIGHT' | 'DARK';
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  type: 'TEXT' | 'ICON';
  iconUrl?: string;
  displayOrder: number;
  createdAt: Date;
}

export interface Experience {
  id: string;
  userId: string;
  type: 'WORK' | 'EDUCATION';
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  portfolioUserId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface PortfolioView {
  id: string;
  portfolioUserId: string;
  viewerIp: string;
  userAgent?: string;
  referrer?: string;
  viewedAt: Date;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}