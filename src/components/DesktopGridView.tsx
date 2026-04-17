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



  // Auto-detect groups based on col ids
  const theoryCACols = cols.filter(c => c.id.match(/^theoryCA[123]$/));
  const practicalCACols = cols.filter(c => c.id.match(/^practicalCA[123]$/));
  // Other columns not included in the hardcoded groups:
  const otherCols = cols.filter(c => !c.id.match(/^theoryCA[123]$/) && !c.id.match(/^practicalCA[123]$/));

  const calculateSubtotal = (scores: any, columns: Column[]) => {
    let sum = 0;
    let hasVal = false;
    columns.forEach(c => {
      const v = scores[c.id];
      if (v && v !== 'ABS') {
        sum += parseFloat(v) || 0;
        hasVal = true;
      }
    });
    return hasVal ? sum.toFixed(1) : '-';
  };

  return (
    <div className="flex-1 overflow-auto px-8 pb-12 hide-scrollbar font-body">
      <div className="min-w-[1200px] bg-white rounded-2xl shadow-sm overflow-hidden border border-surface-container mt-6">
        <table className="w-full border-collapse table-fixed text-sm">
          <thead>
            {/* Row 1: High Level Categories */}
            <tr className="bg-surface-container-highest text-primary">
              <th className="w-64 sticky left-0 z-30 bg-surface-container-highest p-4 text-left font-headline font-extrabold border-r border-surface-container text-xs uppercase tracking-widest" rowSpan={2}>
                Student Information
              </th>
              {theoryCACols.length > 0 && (
                <th className="p-2 text-center font-headline font-bold border-b border-surface-container text-[11px] uppercase tracking-widest border-r border-surface-container" colSpan={theoryCACols.length + 1}>
                  Continuous Assessment: Theory (15%)
                </th>
              )}
              {practicalCACols.length > 0 && (
                <th className="p-2 text-center font-headline font-bold border-b border-surface-container text-[11px] uppercase tracking-widest border-r border-surface-container" colSpan={practicalCACols.length + 1}>
                  Continuous Assessment: Practical (15%)
                </th>
              )}
              {otherCols.map(col => (
                <th key={col.id} className={`w-24 p-2 text-center font-headline font-bold text-[11px] uppercase tracking-widest ${col.id === 'grandTotal' || col.id === 'grade' ? 'bg-surface-dim text-primary' : 'bg-primary text-white'}`} rowSpan={2}>
                  {col.label}
                </th>
              ))}
            </tr>
            {/* Row 2: Specific Columns */}
            <tr className="bg-surface-container-low text-secondary">
              {theoryCACols.map(col => (
                <th key={col.id} className="w-24 p-2 text-center font-bold text-[10px] border-r border-surface-container">
                  {col.label.replace('Theory ', '')} (5)
                </th>
              ))}
              {theoryCACols.length > 0 && (
                <th className="w-24 p-2 text-center font-bold text-[10px] bg-surface-container-high border-r border-surface-container text-primary">Subtotal</th>
              )}
              {practicalCACols.map(col => (
                <th key={col.id} className="w-24 p-2 text-center font-bold text-[10px] border-r border-surface-container">
                  {col.label.replace('Practical ', '')} (5)
                </th>
              ))}
              {practicalCACols.length > 0 && (
                <th className="w-24 p-2 text-center font-bold text-[10px] bg-surface-container-high border-r border-surface-container text-primary">Subtotal</th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.matricNo} className="group hover:bg-surface-container-low/30 transition-colors">
                <td className="sticky left-0 z-20 bg-white group-hover:bg-surface-container-low/50 p-4 border-r border-surface-container shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{student.name}</span>
                    <span className="text-[10px] font-mono text-secondary tracking-tighter">{student.matricNo}</span>
                  </div>
                </td>
                
                {/* Theory Cells */}
                {theoryCACols.map(col => {
                  const value = student.scores[col.id] || '';
                  const isExceeding = parseFloat(value) > 5;
                  return (
                    <td key={col.id} className={`grid-cell p-2 border-r border-surface-container ${isExceeding ? 'bg-error-container relative' : ''}`}>
                      <div className="flex items-center gap-1 group/input">
                        <input
                           id={`cell-${student.matricNo}-${col.id}`}
                           className={`grid-input w-full p-1 text-center border-none bg-transparent ${isExceeding ? 'font-bold text-error' : 'font-medium'} focus:ring-0`}
                           type="text"
                           value={value}
                           onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                           onKeyDown={(e) => handleKeyDown(e, student.matricNo, col.id)}
                           onFocus={() => setActiveCell({ rowId: student.matricNo, colId: col.id })}
                        />
                        <button onMouseDown={(e) => { e.preventDefault(); handleScoreChange(student.matricNo, col.id, 'ABS'); }} className={`opacity-0 group-hover/input:opacity-100 text-[9px] px-1 rounded font-bold ${value === 'ABS' ? 'bg-primary text-white opacity-100' : 'bg-surface-container-highest hover:bg-primary hover:text-white'}`}>ABS</button>
                        {isExceeding && <span className="material-symbols-outlined text-error text-xs">error</span>}
                      </div>
                      {isExceeding && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-[10px] rounded shadow-xl z-50">
                          <div className="font-bold mb-1">Out of Range Error</div>
                          Max value is 5.0. Entry rejected.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-inverse-surface"></div>
                        </div>
                      )}
                    </td>
                  );
                })}
                {theoryCACols.length > 0 && (
                  <td className="p-2 border-r border-surface-container bg-surface-container-low text-center font-bold text-secondary">
                    {calculateSubtotal(student.scores, theoryCACols)}
                  </td>
                )}

                {/* Practical Cells */}
                {practicalCACols.map(col => {
                  const value = student.scores[col.id] || '';
                  const isExceeding = parseFloat(value) > 5;
                  return (
                    <td key={col.id} className={`grid-cell p-2 border-r border-surface-container ${isExceeding ? 'bg-error-container relative' : ''}`}>
                      <div className="flex items-center gap-1 group/input">
                        <input
                           id={`cell-${student.matricNo}-${col.id}`}
                           className={`grid-input w-full p-1 text-center border-none bg-transparent ${isExceeding ? 'font-bold text-error' : 'font-medium'} focus:ring-0`}
                           type="text"
                           value={value}
                           onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                           onKeyDown={(e) => handleKeyDown(e, student.matricNo, col.id)}
                           onFocus={() => setActiveCell({ rowId: student.matricNo, colId: col.id })}
                        />
                        <button onMouseDown={(e) => { e.preventDefault(); handleScoreChange(student.matricNo, col.id, 'ABS'); }} className={`opacity-0 group-hover/input:opacity-100 text-[9px] px-1 rounded font-bold ${value === 'ABS' ? 'bg-primary text-white opacity-100' : 'bg-surface-container-highest hover:bg-primary hover:text-white'}`}>ABS</button>
                        {isExceeding && <span className="material-symbols-outlined text-error text-xs">error</span>}
                      </div>
                      {isExceeding && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-[10px] rounded shadow-xl z-50">
                          <div className="font-bold mb-1">Out of Range Error</div>
                          Max value is 5.0. Entry rejected.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-inverse-surface"></div>
                        </div>
                      )}
                    </td>
                  );
                })}
                {practicalCACols.length > 0 && (
                  <td className="p-2 border-r border-surface-container bg-surface-container-low text-center font-bold text-secondary">
                    {calculateSubtotal(student.scores, practicalCACols)}
                  </td>
                )}
                
                {/* Other Cells (Exam, Total, Grade) */}
                {otherCols.map(col => {
                  const value = student.scores[col.id] || '';
                  const isExceeding = col.id === 'examTheory' ? parseFloat(value) > 70 : false;
                  return (
                    <td key={col.id} className={`grid-cell p-2 ${col.id === 'grandTotal' || col.id === 'grade' ? 'text-center font-extrabold text-tertiary bg-tertiary/5 border-r border-surface-container' : 'border-r border-surface-container bg-primary/5'} ${isExceeding ? 'bg-error-container relative' : ''}`}>
                      <input
                         id={`cell-${student.matricNo}-${col.id}`}
                         className={`grid-input w-full p-1 text-center border-none bg-transparent ${isExceeding ? 'font-bold text-error' : 'font-bold text-primary'} focus:ring-0`}
                         type="text"
                         value={value}
                         onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                         onKeyDown={(e) => handleKeyDown(e, student.matricNo, col.id)}
                         onFocus={() => setActiveCell({ rowId: student.matricNo, colId: col.id })}
                      />
                      {isExceeding && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-[10px] rounded shadow-xl z-50">
                          <div className="font-bold mb-1">Out of Range Error</div>
                          Max value is 70. Entry rejected.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-inverse-surface"></div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
