export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  engineerId?: number;
  groupId?: number;
  groupName?: string;
}

export interface Project {
  id?: number;
  customerId: number;
  projectCode: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  billingType?: string;
  unitPrice?: number;
  requiredHeadcount?: number;
  totalBillingRate?: number;
}

export interface Customer {
  id?: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
}

export interface Engineer {
  id?: number;
  employeeNumber?: string;
  name: string;
  email?: string;
  phone?: string;
  skillSet?: string;
  experienceYears?: number;
  experienceMonths?: number;
  employmentStatus: string;
  groupId?: number;
  grade?: number;
  subGrade?: string;
  groupName?: string;
  departmentName?: string;
  gradeName?: string;
  costRate?: number;
}

export interface GradeMaster {
  id: number;
  grade: number;
  subGrade: string;
  name: string;
  costRate: number;
}

export interface Department {
  id?: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  directorId?: number;
  directorName?: string;
  groups?: Group[];
}

export interface Group {
  id?: number;
  departmentId: number;
  code: string;
  name: string;
  description?: string;
  leaderId?: number;
  displayOrder?: number;
  isActive?: boolean;
  departmentName?: string;
  leaderName?: string;
}

export interface Revenue {
  id?: number;
  yearMonth: string;
  assignmentId: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface RevenueSummary {
  id: number;
  name: string;
  parentName?: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitRate: number;
}

export interface MonthlyRevenue {
  yearMonth: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface AssignmentSchedule {
  assignmentId: number;
  engineerId: number;
  engineerName: string;
  groupName?: string;
  departmentName?: string;
  projectId: number;
  projectName: string;
  customerName?: string;
  startDate: string;
  endDate: string;
  role?: string;
  status: string;
  billingRate?: number;
}

export interface Assignment {
  id?: number;
  projectId: number;
  engineerId: number;
  startDate: string;
  endDate: string;
  role?: string;
  billingRate?: number;
  costRate?: number;
  workingHoursPerMonth?: number;
  status: string;
}

export interface RevenueForecast {
  id: number;
  name: string;
  parentName?: string;
  confirmedRevenue: number;
  estimatedRevenue: number;
  totalRevenue: number;
  confirmedCost: number;
  estimatedCost: number;
  totalCost: number;
  confirmedProfit: number;
  estimatedProfit: number;
  totalProfit: number;
}

export interface ResourceShortageAlert {
  projectId: number;
  projectName: string;
  customerName?: string;
  projectStatus: string;
  requiredHeadcount: number;
  assignedCount: number;
  shortage: number;
  projectStartDate?: string;
  projectEndDate?: string;
}

export interface GrossProfitTrend {
  yearMonth: string;
  id?: number;
  name?: string;
  parentName?: string;
  confirmedRevenue: number;
  estimatedRevenue: number;
  totalRevenue: number;
  confirmedCost: number;
  estimatedCost: number;
  totalCost: number;
  confirmedProfit: number;
  estimatedProfit: number;
  totalProfit: number;
}

export interface MemberAssignment {
  engineerId: number;
  engineerName: string;
  role?: string;
  startDate: string;
  endDate: string;
}

export interface ProjectAssignment {
  projectId: number;
  projectName: string;
  customerName?: string;
  members: MemberAssignment[];
}

export interface GroupMemberAssignmentResponse {
  groupId: number;
  groupName: string;
  projects: ProjectAssignment[];
}
