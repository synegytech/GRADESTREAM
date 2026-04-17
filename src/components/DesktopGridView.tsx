import React from 'react';

interface Student {
  sn: number;
  name: string;
  matricNo: string;
  rowNumber: number;
  scores: any;
}

interface Column {
  id: string;
  label: string;
}

interface DesktopGridViewProps {
  students: Student[];
  cols: Column[];
  activeCell: { rowId: string; colId: string } | null;
  setActiveCell: (cell: { rowId: string; colId: string } | null) => void;
  handleScoreChange: (matricNo: string, colId: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, matricNo: string, colId: string) => void;
}

export default function DesktopGridView({
  students,
  cols,
  activeCell,
  setActiveCell,
  handleScoreChange,
  handleKeyDown,
}: DesktopGridViewProps) {



  return (
    <div className="flex-1 overflow-auto bg-surface-container-low p-6 font-body">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-on-surface/5 overflow-hidden min-w-[1200px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/80 backdrop-blur-md">
              <th className="sticky left-0 z-20 bg-surface-container-highest px-6 py-6 text-left font-headline uppercase tracking-widest text-[10px] font-black text-primary border-r border-outline-variant/10">
                Student Name
              </th>
              <th className="sticky left-[180px] z-20 bg-surface-container-highest px-6 py-6 text-left font-headline uppercase tracking-widest text-[10px] font-black text-primary border-r border-outline-variant/10">
                Matric No.
              </th>
              {cols.map((col) => (
                <th key={col.id} className={`px-4 py-6 text-center font-headline uppercase tracking-widest text-[10px] font-black ${col.id.toLowerCase().includes('total') || col.id === 'grade' ? 'academic-gradient text-white' : 'text-primary'}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {students.map((student) => (
              <tr key={student.matricNo} className="grid-crosshair-row group transition-colors">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-surface-container-low px-6 py-5 font-bold text-primary text-sm border-r border-outline-variant/10">
                  {student.name}
                </td>
                <td className="sticky left-[180px] z-10 bg-white group-hover:bg-surface-container-low px-6 py-5 font-mono text-xs text-secondary border-r border-outline-variant/10">
                  {student.matricNo}
                </td>
                {cols.map((col) => {
                  const isActive = activeCell?.rowId === student.matricNo && activeCell?.colId === col.id;
                  const value = student.scores[col.id] || '';
                  const isExceeding = col.id.includes('CA') && parseFloat(value) > 30; // Just an example validation

                  return (
                    <td key={col.id} className="px-2 py-2 grid-cell focus-within:z-30 relative">
                      <div className={`flex items-center gap-1 border rounded px-2 py-1 ${isExceeding ? 'border-2 border-error bg-error/10' : 'bg-surface-container-lowest border-transparent group-focus-within:border-primary/20'}`}>
                        <input
                          id={`cell-${student.matricNo}-${col.id}`}
                          type="text"
                          value={value}
                          onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, student.matricNo, col.id)}
                          onFocus={() => setActiveCell({ rowId: student.matricNo, colId: col.id })}
                          className={`w-full bg-transparent border-none p-0 text-center text-sm focus:ring-0 ${isExceeding ? 'font-bold text-error' : ''}`}
                        />
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input onBlur
                            handleScoreChange(student.matricNo, col.id, 'ABS');
                          }}
                          className="abs-button items-center justify-center bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm active:scale-95 transition-transform">
                          ABS
                        </button>
                      </div>
                    </td>
                  );
                })}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Action Button (Contextual) */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        <span className="absolute right-20 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Add New Student
        </span>
      </button>
    </div>
  );
}
