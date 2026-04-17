import React, { useState } from 'react';
import { EntryMode } from '../App';

interface Column {
  id: string;
  label: string;
}

interface Student {
  sn: number;
  name: string;
  matricNo: string;
  rowNumber: number;
  scores: any;
}

interface MobileScriptFlipViewProps {
  students: Student[];
  cols: Column[];
  activeCell: { rowId: string; colId: string } | null;
  setActiveCell: (cell: { rowId: string; colId: string } | null) => void;
  handleScoreChange: (matricNo: string, colId: string, value: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isListening: boolean;
  toggleListening: () => void;
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
}

export default function MobileScriptFlipView({
  students,
  cols,
  activeCell,
  setActiveCell,
  handleScoreChange,
  searchQuery,
  setSearchQuery,
  isListening,
  toggleListening,
  entryMode,
  setEntryMode
}: MobileScriptFlipViewProps) {

  // Auto-select first cell if none active
  React.useEffect(() => {
    if (!activeCell && students.length > 0 && cols.length > 0) {
      setActiveCell({ rowId: students[0].matricNo, colId: cols[0].id });
    }
  }, [activeCell, students, cols, setActiveCell]);

  if (!activeCell || students.length === 0) return null;

  const currentStudentIndex = students.findIndex((s) => s.matricNo === activeCell.rowId);
  const currentColIndex = cols.findIndex((c) => c.id === activeCell.colId);
  
  const student = students[currentStudentIndex];
  const col = cols[currentColIndex];

  if (!student || !col) return null;

  const handleNext = () => {
    if (entryMode === 'horizontal') {
      if (currentColIndex < cols.length - 1) {
        setActiveCell({ rowId: student.matricNo, colId: cols[currentColIndex + 1].id });
      } else if (currentStudentIndex < students.length - 1) {
        setActiveCell({ rowId: students[currentStudentIndex + 1].matricNo, colId: cols[0].id });
      }
    } else {
      if (currentStudentIndex < students.length - 1) {
        setActiveCell({ rowId: students[currentStudentIndex + 1].matricNo, colId: col.id });
      } else if (currentColIndex < cols.length - 1) {
        setActiveCell({ rowId: students[0].matricNo, colId: cols[currentColIndex + 1].id });
      }
    }
  };

  const handlePrev = () => {
    if (entryMode === 'horizontal') {
      if (currentColIndex > 0) {
        setActiveCell({ rowId: student.matricNo, colId: cols[currentColIndex - 1].id });
      } else if (currentStudentIndex > 0) {
        setActiveCell({ rowId: students[currentStudentIndex - 1].matricNo, colId: cols[cols.length - 1].id });
      }
    } else {
      if (currentStudentIndex > 0) {
        setActiveCell({ rowId: students[currentStudentIndex - 1].matricNo, colId: col.id });
      } else if (currentColIndex > 0) {
        setActiveCell({ rowId: students[students.length - 1].matricNo, colId: cols[currentColIndex - 1].id });
      }
    }
  };

  const jumpTo = () => {
    if (!searchQuery) return;
    const idx = students.findIndex(s => s.matricNo.slice(-3).includes(searchQuery));
    if (idx !== -1) {
      setActiveCell({ rowId: students[idx].matricNo, colId: col.id });
      setSearchQuery('');
    } else {
      alert("No student found with those digits.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 font-body h-full bg-surface">
      {/* Status Indicator */}
      <div className="flex justify-between items-end">
        <div>
          <span className="font-headline uppercase tracking-wider text-[11px] font-bold text-on-secondary-fixed-variant bg-secondary-container px-2 py-1 rounded-lg">
            {col.label} • {currentStudentIndex + 1}/{students.length} Students
          </span>
          <p className="text-on-surface-variant text-sm mt-1">Flipped Mode: Manual Entry</p>
        </div>
        <div className="flex items-center gap-2 text-on-tertiary-container font-semibold text-sm">
          <div className="w-2 h-2 rounded-full bg-on-tertiary-container"></div>
          Syncing Live
        </div>
      </div>

      {/* Single Student Grading Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8 flex flex-col items-center gap-8 border-b-4 border-primary">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-extrabold text-primary mb-2 line-clamp-2 min-h-24 md:min-h-max flex items-center justify-center">
             {student.name}
          </h2>
          <div className="font-label text-secondary tracking-widest text-sm font-medium">MATRIC NO: {student.matricNo}</div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <label className="font-headline uppercase tracking-widest text-[11px] font-bold text-secondary text-center">
            {col.label} Score
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                className="w-full bg-surface-container-low border-none rounded-xl text-center py-10 text-6xl font-headline font-bold text-primary focus:ring-2 focus:ring-on-tertiary-container transition-all"
                type="text"
                placeholder="--"
                value={student.scores[col.id] || ''}
                onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
              />
            </div>
            <button 
              onClick={() => handleScoreChange(student.matricNo, col.id, 'ABS')}
              className="h-full px-6 bg-error-container text-error rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">block</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">ABS</span>
            </button>
          </div>
        </div>

        {/* Contextual Toggles */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button 
            onClick={toggleListening}
            className={`py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all
              ${isListening ? 'bg-error-container text-error' : 'bg-surface-container-low text-primary'}`}
          >
            <span className="material-symbols-outlined">mic</span>
            Voice
          </button>
          <button 
            onClick={() => setEntryMode(entryMode === 'vertical' ? 'horizontal' : 'vertical')}
            className={`py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all
             ${entryMode === 'vertical' ? 'bg-on-tertiary-container/10 text-on-tertiary-container' : 'bg-surface-container-low text-primary'}`}
          >
            <span className="material-symbols-outlined">{entryMode === 'vertical' ? 'swap_vert' : 'swap_horiz'}</span>
            {entryMode === 'vertical' ? 'Down Mode' : 'Right Mode'}
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-4">
        <button onClick={handlePrev} className="flex-1 bg-surface-container-high py-5 rounded-xl flex items-center justify-center gap-3 text-secondary font-bold active:scale-95 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
          Previous
        </button>
        <button onClick={handleNext} className="flex-1 academic-gradient py-5 rounded-xl flex items-center justify-center gap-3 text-white font-bold active:scale-95 transition-all">
          Next
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* Persistent Smart Jump & Global Controls */}
      <footer className="bg-surface-container-highest p-5 rounded-t-[2rem] flex flex-col gap-4 shadow-2xl mt-auto">
        <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
          <div className="pl-3 text-secondary">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-outline/50"
            maxLength={3}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && jumpTo()}
            placeholder="Enter last 3 digits..."
            type="text"
          />
          <button onClick={jumpTo} className="bg-primary text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider active:scale-95">
            Jump
          </button>
        </div>
      </footer>
    </div>
  );
}
