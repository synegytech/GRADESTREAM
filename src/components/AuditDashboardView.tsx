import React from 'react';

interface Student {
  sn: number;
  name: string;
  matricNo: string;
  rowNumber: number;
  scores: any;
}

interface AuditDashboardViewProps {
  students: Student[];
  auditReport: any;
  runAudit: () => void;
}

export default function AuditDashboardView({ students, auditReport, runAudit }: AuditDashboardViewProps) {
  // If audit hasn't been run yet, run it
  React.useEffect(() => {
    if (!auditReport && students.length > 0) {
      runAudit();
    }
  }, [auditReport, students, runAudit]);

  const totalStudents = students.length;
  // Approximation of "Graded" for dashboard
  const graded = auditReport ? Math.round((auditReport.completionRate / 100) * totalStudents) : 0;
  const completionRate = auditReport?.completionRate || 0;
  const strokeDashoffset = 553 - (553 * completionRate) / 100;

  return (
    <div className="p-8 space-y-8 font-body">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline">Dashboards</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-headline">VUA-SEN 103</span>
          </nav>
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Audit Dashboard: VUA-SEN 103</h2>
          <p className="text-secondary mt-1 font-medium">Foundations of Computational Linguistics</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-outline-variant text-primary font-bold text-sm bg-white hover:bg-surface-container-low transition-all">
            Export Report
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-lg transition-all">
            Archive Session
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary">
          <p className="text-[10px] font-bold font-headline uppercase tracking-widest text-secondary mb-2">Total Students</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-primary">{totalStudents}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-on-tertiary-container">
          <p className="text-[10px] font-bold font-headline uppercase tracking-widest text-secondary mb-2">Graded</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-primary">{graded}</span>
            <span className="text-xs text-secondary font-medium">/ {totalStudents} processed</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary">
          <p className="text-[10px] font-bold font-headline uppercase tracking-widest text-secondary mb-2">Average Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-primary">--</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-outline">
          <p className="text-[10px] font-bold font-headline uppercase tracking-widest text-secondary mb-2">Validation Problems</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-primary">{auditReport?.validationReport?.length || 0}</span>
            {auditReport?.validationReport?.length > 0 && <span className="text-xs text-error font-medium">Review needed</span>}
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Validation Issues Block instead of grade curve (more useful for the user context) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-primary">Validation Report</h3>
              <p className="text-sm text-secondary">Checking for missing or out-of-bound variables</p>
            </div>
          </div>
          <div className="mt-4">
              {auditReport && auditReport.validationReport?.length === 0 ? (
                <p className="text-sm text-on-tertiary-container font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">check_circle</span> All scores are within valid ranges.
                </p>
              ) : (
                <ul className="list-disc pl-5 text-sm text-error space-y-2 font-medium">
                  {auditReport?.validationReport?.map((msg: string, i: number) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
          </div>
        </div>

        {/* Completion Progress */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary text-white p-8 rounded-xl shadow-lg relative overflow-hidden h-full flex flex-col justify-center items-center text-center">
            {/* Abstract Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            <h3 className="text-lg font-headline font-bold mb-8 z-10">Completion Progress</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-white/10" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12" />
                <circle
                  className="text-tertiary-fixed-dim"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="currentColor"
                  strokeDasharray="553"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="12"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-headline font-extrabold">{completionRate.toFixed(1)}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Complete</span>
              </div>
            </div>
            <p className="text-sm opacity-80 max-w-[200px] z-10">{totalStudents - graded} papers remaining in this grading session queue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
