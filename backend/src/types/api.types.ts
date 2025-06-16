export interface ApiResponse<T> {
  metadata?: T;
  message?: string[];
  isSuccess: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  isSuccess: false;
  message: string[];
  metadata: null;
  error?: {
    code: string;
    details?: any;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: number;
}

export interface FaceRegistrationRequest {
  faceRegises: {
    faceFile: Express.Multer.File;
    statusFaceTurn: string;
    descriptor: string;
  }[];
}

export interface FaceUpdateRequest {
  faceRegisUpdates: {
    id: string;
    faceFile: Express.Multer.File;
    statusFaceTurn: string;
    descriptor: string;
  }[];
}

export interface AttendanceCheckRequest {
  timeSweep: string;
  statusHistory: number;
}

export interface WorkPlanRequest {
  timeStart: string;
  timeEnd: string;
  statusCalendar: number;
  dayWorks?: {
    presentShift: string;
    shiftTime: number;
  }[];
}
