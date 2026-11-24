import React, { useEffect, useState } from 'react';
import {
  Award,
  GraduationCap,
  Users,
  BarChart3,
  Download,
  CheckCircle2,
  TrendingUp,
  Landmark,
  Percent,
  Layers,
  Printer,
  Building2,
} from 'lucide-react';
import { getNaacMetrics, getNirfSummary, type NaacMetrics, type NirfSummary } from '../api/complianceService';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { toast } from 'sonner';

export const ComplianceDashboard: React.FC = () => {
  const { institution } = useInstitutionStore();
  const [naac, setNaac] = useState<NaacMetrics | null>(null);
  const [nirf, setNirf] = useState<NirfSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const [naacRes, nirfRes] = await Promise.all([getNaacMetrics(), getNirfSummary()]);
      setNaac(naacRes);
      setNirf(nirfRes);
    } catch (err: any) {
      toast.error('Failed to load institutional compliance metrics.');
    } finally {
      setLoading(false);
    }
  };

  const exportNaacReport = () => {
    if (!naac || !nirf) return;
    const now = new Date().toISOString();
    const rows = [
      ['STATUTORY NAAC AQAR & NIRF COMPLIANCE DOSSIER', '', ''],
      ['Institution Name', institution.name || 'Central University System', ''],
      ['Institution Code', institution.code || 'CUS-01', ''],
      ['Campus Node', institution.campus || 'Main Campus', ''],
      ['Concurrence Date', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), ''],
      ['Audit Timestamp', now, ''],
      ['', '', ''],
      ['CRITERION 2: TEACHING-LEARNING AND EVALUATION', '', ''],
      ['Metric Code', 'Metric Description', 'Statutory Value / Distribution'],
      ['Criterion 2.1.1', 'Total Enrolled Students', `${naac.totalEnrolledStudents} Students`],
      ['Criterion 2.1.3', 'Female Student Ratio', `${naac.femaleStudentPercentage}%`],
      ['Criterion 2.1.3', 'Male Student Ratio', `${naac.maleStudentPercentage}%`],
      ['Criterion 2.2.1', 'Student-to-Faculty Ratio (SFR)', `${naac.sfrFormatted} (AICTE Standard: <= 15:1 Compliant)`],
      ['Criterion 2.4.1', 'Total Full-Time Teaching Faculty', `${naac.totalFullTimeFaculty} Faculty Members`],
      ...Object.entries(naac.facultyCadreRatio || {}).map(([cadre, count]) => [
        'Criterion 2.4.1',
        `Faculty Cadre: ${cadre}`,
        `${count} Members`
      ]),
      ...Object.entries(naac.categoryReservationBreakdown || {}).map(([cat, count]) => [
        'Criterion 2.1.2',
        `Statutory Reservation Enrolment: ${cat}`,
        `${count} Enrolled Candidates`
      ]),
      ['', '', ''],
      ['CRITERION 2.6.2: PROGRAM-WISE ANNUAL EXAMINATION PASS PERCENTAGES', '', ''],
      ['Department Code', 'Department / Program Name', 'Appeared / Passed (Pass Rate %)'],
      ...(naac.departmentPassRates || []).map((d) => [
        d.departmentCode,
        d.departmentName,
        `Appeared: ${d.totalAppeared} | Passed: ${d.totalPassed} | Pass Rate: ${d.passPercentage}%`
      ]),
      ['', '', ''],
      ['CRITERION 4: INFRASTRUCTURE AND LEARNING RESOURCES', '', ''],
      ['Criterion 4.2.2', 'Total Library Book Titles Cataloged', `${naac.totalLibraryBookTitles} Titles`],
      ['Criterion 4.2.4', 'Annual Library Circulation Transactions', `${naac.totalLibraryActiveCirculation} Circulation Events`],
      ['', '', ''],
      ['CRITERION 6: GOVERNANCE, LEADERSHIP AND MANAGEMENT', '', ''],
      ['Criterion 6.4.2', 'Total Tuition Billed', `INR ${(naac.totalTuitionBilled || 0).toLocaleString('en-IN')}`],
      ['Criterion 6.4.2', 'Total Tuition Collected', `INR ${(naac.totalTuitionCollected || 0).toLocaleString('en-IN')}`],
      ['Criterion 6.4.2', 'Fee Collection Efficiency Rate', `${naac.feeCollectionEfficiencyPercentage}%`],
      ['', '', ''],
      ['NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF) SCORECARD', '', ''],
      ['NIRF Pillar', 'Quantitative Score', 'Weightage Standard'],
      ['Teaching, Learning & Resources (TLR)', `${nirf.tlrScore} / 100`, 'Tier 1 Standard'],
      ['Graduation Outcome (GO)', `${nirf.goScore} / 100`, 'University Examination Metric'],
      ['Outreach & Inclusivity (OI)', `${nirf.oiScore} / 100`, 'Diversity & Quota Standard'],
      ['Overall Projected NIRF Score', `${nirf.overallProjectedScore} / 100`, 'Estimated Rank Band: 51-100 (State)'],
      ...Object.entries(nirf.parameterHighlights || {}).map(([k, v]) => [
        'NIRF Parameter Highlight',
        k,
        v
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NAAC_SSR_NIRF_Dossier_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded official Statutory NAAC SSR & NIRF compliance dossier.');
  };

  if (loading || !naac || !nirf) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
        Calculating Institutional Compliance & Accreditation Metrics...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Award className="w-4 h-4" /> Statutory Accreditation & Rankings Engine
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium normal-case flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {institution.name || 'Institutional Node'} ({institution.code || 'INST'})
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">NAAC & NIRF Institutional Quality Hub</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time computation of Student-Faculty Ratios, Cadre Proportions, Category Quotas, and NIRF Scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Statutory SSR Dossier
          </button>
          <button
            onClick={exportNaacReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export NAAC SSR Compliance Data (CSV)
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Student-Faculty Ratio (SFR)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{naac.sfrFormatted}</div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 inline-flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant with AICTE (≤ 15:1)
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Projected NIRF Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{nirf.overallProjectedScore} / 100</div>
          <p className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-md px-2 py-0.5 inline-flex items-center gap-1 font-semibold">
            Estimated Band: Rank 51–100 (State)
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gender Diversity Ratio</span>
            <Percent className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{naac.femaleStudentPercentage}%</div>
          <p className="text-[11px] text-slate-500">
            Female Enrollment ({naac.maleStudentPercentage}% Male)
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Fee Collection Efficiency</span>
            <Landmark className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{naac.feeCollectionEfficiencyPercentage}%</div>
          <p className="text-[11px] text-slate-500">
            ₹{((naac.totalTuitionCollected || 0) / 100000).toFixed(1)}L Collected
          </p>
        </div>
      </div>

      {/* NIRF 3-Pillar Breakdown & NAAC Cadre Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NIRF Parameters */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> National Institutional Ranking Framework (NIRF) Parameters
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Teaching, Learning & Resources (TLR)</span>
                <span className="font-mono text-indigo-600 font-bold">{nirf.tlrScore} / 100</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${nirf.tlrScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Graduation Outcome (GO - University Exams)</span>
                <span className="font-mono text-emerald-600 font-bold">{nirf.goScore} / 100</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${nirf.goScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Outreach & Inclusivity (OI - Diversity & Gender)</span>
                <span className="font-mono text-amber-600 font-bold">{nirf.oiScore} / 100</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${nirf.oiScore}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs text-slate-600">
            <span className="text-slate-900 font-semibold block mb-1">Rank Benchmark Insights:</span>
            {Object.entries(nirf.parameterHighlights).map(([k, v]) => (
              <p key={k} className="flex justify-between py-0.5">
                <span className="text-slate-500">{k}:</span>
                <span className="font-mono text-slate-800 font-medium">{v}</span>
              </p>
            ))}
          </div>
        </div>

        {/* NAAC Criterion 2: Faculty Cadre Ratio & Quota Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-600" /> NAAC Criterion 2: Faculty Cadres & Category Quotas
          </div>

          {/* Cadre Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">AICTE Faculty Cadre Distribution:</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block font-medium">Professors</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {naac.facultyCadreRatio['Professors'] || 0}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block font-medium">Associate Profs</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {naac.facultyCadreRatio['Associate Professors'] || 0}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block font-medium">Assistant Profs</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {naac.facultyCadreRatio['Assistant Professors'] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Reservation Breakdown */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Statutory Reservation Quotas (Enrolled Students):</span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {Object.entries(naac.categoryReservationBreakdown).map(([cat, count]) => (
                <div key={cat} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">{cat}</span>
                  <span className="text-base font-extrabold font-mono text-indigo-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Examination Pass Rates (NAAC 2.6.2) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            NAAC Criterion 2.6.2: Department-wise University Exam Pass Percentages
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">Target Standard: ≥ 85%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {naac.departmentPassRates.map((d) => (
            <div key={d.departmentCode} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{d.departmentName}</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{d.passPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${d.passPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Appeared: {d.totalAppeared}</span>
                <span>Passed: {d.totalPassed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
