import axiosClient from './axiosClient';

export interface StudentImportRow {
  rowNumber: number;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentCode: string;
  batchName: string;
  phone?: string;
  category?: string;
  gender?: string;
  status?: string;
  valid: boolean;
  validationError?: string;
}

export interface FeeInvoiceImportRow {
  rowNumber: number;
  invoiceNumber: string;
  enrollmentNumber: string;
  feeStructureName: string;
  grossAmount: number;
  discount: number;
  amountPaid: number;
  dueDate: string;
  valid: boolean;
  validationError?: string;
}

export interface ImportValidationResult<T> {
  importType: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  globalErrors: string[];
  rows: T[];
  readyToCommit: boolean;
}

export interface ImportExecutionResponse {
  importType: string;
  successCount: number;
  failureCount: number;
  message: string;
  committedIdentifiers: string[];
  errorMessages: string[];
}

export const validateStudentsCsv = async (file: File): Promise<ImportValidationResult<StudentImportRow>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post<ImportValidationResult<StudentImportRow>>(
    '/api/v1/migration/students/validate',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const commitStudents = async (rows: StudentImportRow[]): Promise<ImportExecutionResponse> => {
  const response = await axiosClient.post<ImportExecutionResponse>('/api/v1/migration/students/commit', rows);
  return response.data;
};

export const validateInvoicesCsv = async (file: File): Promise<ImportValidationResult<FeeInvoiceImportRow>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post<ImportValidationResult<FeeInvoiceImportRow>>(
    '/api/v1/migration/invoices/validate',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const commitInvoices = async (rows: FeeInvoiceImportRow[]): Promise<ImportExecutionResponse> => {
  const response = await axiosClient.post<ImportExecutionResponse>('/api/v1/migration/invoices/commit', rows);
  return response.data;
};

export const downloadTemplateUrl = (type: 'students' | 'fees'): string => {
  return `/api/v1/migration/templates/${type}`;
};
