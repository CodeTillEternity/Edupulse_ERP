import type { ComponentType } from 'react';

declare module '*.jsx' {
  const component: ComponentType<any>;
  export default component;
}

declare module '../api/financeService' {
  export const getInvoices: (params: any) => Promise<any>;
  export const getFeeHeads: () => Promise<any>;
  export const createFeeHead: (data: any) => Promise<any>;
  export const getFeeStructures: () => Promise<any>;
  export const createFeeStructure: (data: any) => Promise<any>;
  export const generateInvoicesForBatch: (batchId: any, structureId: any, dueDate: any) => Promise<any>;
  export const getStudentLedger: (studentId: any) => Promise<any>;
  export const recordFeePayment: (data: any) => Promise<any>;
  const financeService: any;
  export default financeService;
}

declare module '../../api/financeService' {
  export const getInvoices: (params: any) => Promise<any>;
  export const getFeeHeads: () => Promise<any>;
  export const createFeeHead: (data: any) => Promise<any>;
  export const getFeeStructures: () => Promise<any>;
  export const createFeeStructure: (data: any) => Promise<any>;
  export const generateInvoicesForBatch: (batchId: any, structureId: any, dueDate: any) => Promise<any>;
  export const getStudentLedger: (studentId: any) => Promise<any>;
  export const recordFeePayment: (data: any) => Promise<any>;
  const financeService: any;
  export default financeService;
}
