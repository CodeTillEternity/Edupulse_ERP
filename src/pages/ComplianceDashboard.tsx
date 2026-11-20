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
} from 'lucide-react';
import { getNaacMetrics, getNirfSummary, type NaacMetrics, type NirfSummary } from '../api/complianceService';
import { toast } from 'sonner';

export const ComplianceDashboard: React.FC = () => {
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
    if (!naac) return;
    const rows = [
      ['Metric', 'Value', 'NAAC Criterion'],
      ['Student-to-Faculty Ratio (SFR)', naac.sfrFormatted, 'Criterion 2.2'],
      ['Total Enrolled Students', naac.totalEnrolledStudents.toString(), 'Criterion 2.1'],
      ['Total Full-Time Faculty', naac.totalFullTimeFaculty.toString(), 'Criterion 2.4'],
      ['Female Student Ratio', `${naac.femaleStudentPercentage}%`, 'Criterion 2.1.3'],
      ['Male Student Ratio', `${naac.maleStudentPercentage}%`, 'Criterion 2.1.3'],
      ['Library Book Titles', naac.totalLibraryBookTitles.toString(), 'Criterion 4.2'],
      ['Library Circulation Activity', naac.totalLibraryActiveCirculation.toString(), 'Criterion 4.2.4'],
      ['Fee Collection Efficiency', `${naac.feeCollectionEfficiencyPercentage}%`, 'Criterion 6.4'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'NAAC_Criterion_AQAR_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded official NAAC AQAR compliance table.');
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Award className="w-4 h-4" /> Statutory Accreditation & Rankings Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">NAAC & NIRF Institutional Quality Hub</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time computation of Student-Faculty Ratios, Cadre Proportions, Category Quotas, and NIRF Scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportNaacReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Export NAAC SSR Compliance Data (CSV)
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Student-Faculty Ratio (SFR)</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{naac.sfrFormatted}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant with AICTE (≤ 15:1)
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Projected NIRF Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{nirf.overallProjectedScore} / 100</div>
          <p className="text-[11px] text-indigo-400 font-semibold">
            Estimated Band: Rank 51–100 (State)
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gender Diversity Ratio</span>
            <Percent className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{naac.femaleStudentPercentage}%</div>
          <p className="text-[11px] text-slate-400">
            Female Enrollment ({naac.maleStudentPercentage}% Male)
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fee Collection Efficiency</span>
            <Landmark className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{naac.feeCollectionEfficiencyPercentage}%</div>
          <p className="text-[11px] text-slate-400">
            ₹{((naac.totalTuitionCollected || 0) / 100000).toFixed(1)}L Collected
          </p>
        </div>
      </div>

      {/* NIRF 3-Pillar Breakdown & NAAC Cadre Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NIRF Parameters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> National Institutional Ranking Framework (NIRF) Parameters
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Teaching, Learning & Resources (TLR)</span>
                <span className="font-mono text-indigo-400 font-bold">{nirf.tlrScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${nirf.tlrScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Graduation Outcome (GO - University Exams)</span>
                <span className="font-mono text-emerald-400 font-bold">{nirf.goScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${nirf.goScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Outreach & Inclusivity (OI - Diversity & Gender)</span>
                <span className="font-mono text-amber-400 font-bold">{nirf.oiScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${nirf.oiScore}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1 text-xs text-slate-400">
            <span className="text-white font-semibold block mb-1">Rank Benchmark Insights:</span>
            {Object.entries(nirf.parameterHighlights).map(([k, v]) => (
              <p key={k} className="flex justify-between py-0.5">
                <span className="text-slate-400">{k}:</span>
                <span className="font-mono text-slate-200">{v}</span>
              </p>
            ))}
          </div>
        </div>

        {/* NAAC Criterion 2: Faculty Cadre Ratio & Quota Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" /> NAAC Criterion 2: Faculty Cadres & Category Quotas
          </div>

          {/* Cadre Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 block">AICTE Faculty Cadre Distribution:</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block">Professors</span>
                <span className="text-xl font-bold font-mono text-white">
                  {naac.facultyCadreRatio['Professors'] || 0}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block">Associate Profs</span>
                <span className="text-xl font-bold font-mono text-white">
                  {naac.facultyCadreRatio['Associate Professors'] || 0}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block">Assistant Profs</span>
                <span className="text-xl font-bold font-mono text-white">
                  {naac.facultyCadreRatio['Assistant Professors'] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Reservation Breakdown */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300 block">Statutory Reservation Quotas (Enrolled Students):</span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {Object.entries(naac.categoryReservationBreakdown).map(([cat, count]) => (
                <div key={cat} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block">{cat}</span>
                  <span className="text-base font-extrabold font-mono text-indigo-300">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Examination Pass Rates (NAAC 2.6.2) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            NAAC Criterion 2.6.2: Department-wise University Exam Pass Percentages
          </div>
          <span className="text-xs font-mono text-slate-400">Target Standard: ≥ 85%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {naac.departmentPassRates.map((d) => (
            <div key={d.departmentCode} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{d.departmentName}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{d.passPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${d.passPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
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
