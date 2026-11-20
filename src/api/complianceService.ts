import axiosClient from './axiosClient';

export interface DepartmentPassRate {
  departmentCode: string;
  departmentName: string;
  totalAppeared: number;
  totalPassed: number;
  passPercentage: number;
}

export interface NaacMetrics {
  studentFacultyRatio: number;
  sfrFormatted: string;
  totalEnrolledStudents: number;
  totalFullTimeFaculty: number;
  facultyCadreRatio: Record<string, number>;
  categoryReservationBreakdown: Record<string, number>;
  femaleStudentPercentage: number;
  maleStudentPercentage: number;
  departmentPassRates: DepartmentPassRate[];
  totalLibraryBookTitles: number;
  totalLibraryActiveCirculation: number;
  totalTuitionBilled: number;
  totalTuitionCollected: number;
  feeCollectionEfficiencyPercentage: number;
}

export interface NirfSummary {
  tlrScore: number;
  facultyStudentRatioScore: number;
  facultyCadreProportionScore: number;
  goScore: number;
  universityExaminationMetric: number;
  medianGraduationEfficiency: number;
  oiScore: number;
  percentageWomenStudents: number;
  economicallyDisadvantagedStudentsPercentage: number;
  overallProjectedScore: number;
  parameterHighlights: Record<string, string>;
}

export const getNaacMetrics = async (): Promise<NaacMetrics> => {
  const response = await axiosClient.get<NaacMetrics>('/api/v1/compliance/naac');
  return response.data;
};

export const getNirfSummary = async (): Promise<NirfSummary> => {
  const response = await axiosClient.get<NirfSummary>('/api/v1/compliance/nirf');
  return response.data;
};
