import React, { useState } from 'react';
import { EntryMode, Tab } from '../App';

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
  setActiveTab: (tab: Tab) => void;
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
  setEntryMode,
  setActiveTab
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

  if (isListening) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-32 flex flex-col w-full h-full absolute inset-0 z-50 overflow-y-auto">
        <header className="sticky top-0 w-full z-50 bg-[#f7f9fb] dark:bg-slate-950">
          <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('Template Upload')} className="transition-colors duration-300 ease-in-out hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#00113a] dark:text-blue-400">arrow_back</span>
              </button>
              <h1 className="font-manrope font-bold text-xl tracking-tight text-[#00113a] dark:text-blue-400">Editorial Authority</h1>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface-container-high overflow-hidden">
              <img alt="Professor Profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8-qXgD2P0hhtWFfy_81asZXBK0wEh6iB8mRCUjOKvZKdxtjOfz_h9YdbG5b7kWj1UJMWQz9A7EOEaZ99U5ZLzNsbgX3GN8MOQ6WOnl0AdkD5vPJiUR0xqSBMjsB5g1P2zaLCoc-g1K7suSOQNOZ4TdsjD71nsL13dULO5N6KInWT_P6Ffdml1c_QVlYk4_eJTj7KTE22XQt2bgVB255y63lFaY0c5kjYBYopeFp57scEQGURGrQDOhXD90_YysTa8UAaF0k3d5Y" />
            </div>
          </div>
        </header>

        <main className="pt-6 px-4 max-w-lg mx-auto w-full flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase tracking-[0.15em] text-secondary font-semibold">Current Session</span>
              <span className="font-headline font-extrabold text-primary text-lg">Script Flip Mode</span>
            </div>
            <div className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-on-tertiary-container rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(0,17,58,0.06)] overflow-hidden relative border border-outline-variant/10">
            <div className="p-8 pb-4 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute -inset-1.5 bg-primary/10 rounded-[2rem] transform rotate-6"></div>
                <div className="absolute -inset-1.5 border-2 border-primary/20 rounded-[2rem]"></div>
                <div className="relative w-full h-full rounded-[1.75rem] overflow-hidden border-4 border-surface-container-lowest shadow-sm flex items-center justify-center bg-surface-container-low text-secondary">
                   <span className="material-symbols-outlined text-5xl">account_circle</span>
                </div>
              </div>
              <h2 className="font-headline font-extrabold text-2xl text-primary mb-1">{student.name}</h2>
              <p className="font-label text-sm text-secondary font-medium tracking-tight">Matric: {student.matricNo}</p>
            </div>

            <div className="bg-surface-container-low mx-4 rounded-xl p-8 mb-4 flex flex-col items-center justify-center min-h-[220px] transition-all duration-300">
              <div onClick={toggleListening} className="mic-pulse w-20 h-20 bg-tertiary-fixed-dim text-on-tertiary-container rounded-2xl flex items-center justify-center mb-6 cursor-pointer shadow-lg active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              </div>
              <div className="text-center w-full">
                <p className="text-on-tertiary-container font-label text-[10px] font-bold uppercase tracking-widest mb-3">Listening for {col.label} score...</p>
                <div className="bg-surface-container-lowest p-5 rounded-xl min-h-[64px] flex items-center justify-center border-2 border-primary/5 shadow-[0_4px_12px_rgba(0,17,58,0.04)]">
                   <span className="font-headline text-xl text-primary font-bold italic">"{student.scores[col.id] || ''}"</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-8">
              <div className="flex items-center justify-between gap-4">
                <button onClick={handlePrev} className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-surface-container-high text-secondary font-bold transition-all hover:bg-surface-container-highest active:scale-95">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                  Previous
                </button>
                <button onClick={handleNext} className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold transition-all hover:bg-primary-container active:scale-95 shadow-md shadow-primary/20">
                  Next
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold ml-1">Smart Jump</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('Audit Dashboard')}
                className="whitespace-nowrap px-4 py-2 bg-white rounded-full border border-outline-variant/30 text-xs font-bold text-primary shadow-sm active:bg-surface-container-low transition-colors"
              >
                Skip to Summary
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white rounded-full border border-outline-variant/30 text-xs font-bold text-primary shadow-sm active:bg-surface-container-low transition-colors">
                Redo Transcription
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white rounded-full border border-outline-variant/30 text-xs font-bold text-primary shadow-sm active:bg-surface-container-low transition-colors">
                Student History
              </button>
            </div>
          </div>

          <details className="mt-4 group bg-surface-container-low rounded-xl border border-outline-variant/10 transition-all duration-300">
            <summary className="list-none flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <span className="font-headline font-bold text-primary">Voice Commands Reference</span>
              </div>
              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex justify-between items-center">
                <code className="font-mono text-sm text-on-primary-fixed-variant font-semibold">"Next student"</code>
                <span className="text-xs text-secondary font-medium uppercase tracking-tighter">Queue</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex justify-between items-center">
                <code className="font-mono text-sm text-on-primary-fixed-variant font-semibold">"Set score to 20"</code>
                <span className="text-xs text-secondary font-medium uppercase tracking-tighter">Entry</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex justify-between items-center">
                <code className="font-mono text-sm text-on-primary-fixed-variant font-semibold">"Undo last"</code>
                <span className="text-xs text-secondary font-medium uppercase tracking-tighter">Revert</span>
              </div>
            </div>
          </details>
        </main>

        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-8 px-4 bg-white/90 backdrop-blur-xl z-50 border-t border-outline-variant/10">
          <div onClick={() => setActiveTab('Course Selection')} className="flex flex-col items-center justify-center bg-primary text-white rounded-2xl px-5 py-2 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer">
             <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grading</span>
             <span className="font-inter text-[10px] font-bold uppercase tracking-widest mt-1">Grading</span>
          </div>
          <div onClick={() => setActiveTab('Template Upload')} className="flex flex-col items-center justify-center text-secondary px-5 py-2 transition-transform duration-200 hover:text-primary active:scale-95 cursor-pointer">
             <span className="material-symbols-outlined">description</span>
             <span className="font-inter text-[10px] font-bold uppercase tracking-widest mt-1">Templates</span>
          </div>
          <div onClick={() => setActiveTab('Audit Dashboard')} className="flex flex-col items-center justify-center text-secondary px-5 py-2 transition-transform duration-200 hover:text-primary active:scale-95 cursor-pointer">
             <span className="material-symbols-outlined">history_edu</span>
             <span className="font-inter text-[10px] font-bold uppercase tracking-widest mt-1">Audit</span>
          </div>
        </nav>
      </div>
    );
  }

  // --- Manual Entry Mode Layout ---
  return (
    <div className="bg-[#f8fafc] font-body text-on-surface overflow-hidden h-full flex flex-col absolute inset-0 z-50">
      <header className="top-0 z-40 bg-white border-b border-[#e2e8f0] flex justify-between items-center w-full px-5 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('Template Upload')} className="cursor-pointer active:scale-95 text-[#00113a]">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <h1 className="font-headline text-lg font-extrabold tracking-tight text-[#00113a] uppercase">GradeStream</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#515f74] cursor-pointer active:scale-95">settings</span>
          <div className="w-9 h-9 rounded-full border-2 border-[#00113a]/10 overflow-hidden bg-slate-200">
            <img alt="Lecturer profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVBYQDafRRR6jSQlVbbVO9w0sx76exjcZYV9QHemlHq8kM6VFmBJIW5OOWN7W2RK6g9WnmE2Q-7QOyv1cmIeZGGcAP3RWUzApVnYY0olrPaYeisHOobR_ZgrtW1DKMYW9iQG9rPMiR_Y8uF9LgWNNUdk3OV7pvOt0nnLBAooIJRigcuFi6sw-PxM2G-IzvD6Z7KaPNDVvpOOrJIAtJGboyiEvzYBkXGBXS9GfbhSH-8wmiyI5cwE8PkHW802kwPc1JSgVsI71s2Bg" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
          <div>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold text-white bg-[#00113a] px-2 py-1 rounded">
               {col.label} • {currentStudentIndex + 1}/{students.length}
            </span>
            <p className="text-[#64748b] text-xs mt-1 font-medium">Manual Entry Mode</p>
          </div>
          <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
            LIVE SYNC
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#f1f5f9] rounded-full mb-4 flex items-center justify-center border border-[#e2e8f0] overflow-hidden">
               <span className="material-symbols-outlined text-4xl text-[#515f74]">account_circle</span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-[#00113a] leading-tight">{student.name}</h2>
            <div className="font-label text-[#515f74] tracking-widest text-sm font-bold mt-1">{student.matricNo}</div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <label className="font-headline uppercase tracking-[0.2em] text-[11px] font-extrabold text-[#515f74] text-center">Score Input (Max 30)</label>
            <div className="flex items-stretch gap-3">
              <div className="flex-1 relative">
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl text-center py-8 text-6xl font-headline font-extrabold text-[#00113a] focus:border-[#00113a] focus:ring-0 transition-all placeholder:text-slate-200" 
                  max="30" 
                  min="0" 
                  placeholder="00" 
                  style={{ fontSize: '64px' }} 
                  type="text"
                  value={student.scores[col.id] || ''}
                  onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                />
                <div className="absolute right-4 bottom-4 text-[#515f74] font-black text-xs">/ 30</div>
              </div>
              <button onClick={() => handleScoreChange(student.matricNo, col.id, 'ABS')} className="w-20 bg-slate-100 text-slate-400 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 active:bg-red-50 active:text-red-600 active:border-red-200 transition-colors">
                 <span className="material-symbols-outlined font-bold">block</span>
                 <span className="text-[10px] font-black uppercase tracking-tighter">ABS</span>
              </button>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <button onClick={toggleListening} className="bg-slate-50 border border-slate-200 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[#00113a] font-bold text-[15px] active:scale-95">
               <span className="material-symbols-outlined text-xl">mic</span>
               Voice
            </button>
            <button onClick={() => setEntryMode(entryMode === 'vertical' ? 'horizontal' : 'vertical')} className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] active:scale-95">
               <span className="material-symbols-outlined text-xl">{entryMode === 'vertical' ? 'swap_vert' : 'swap_horiz'}</span>
               {entryMode === 'vertical' ? 'Down Mode' : 'Right Mode'}
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-auto pb-4">
          <button onClick={handlePrev} className="flex-1 bg-white border border-slate-200 py-5 rounded-2xl flex items-center justify-center gap-3 text-[#00113a] font-extrabold active:scale-95 transition-all text-base shadow-sm">
             <span className="material-symbols-outlined font-bold">chevron_left</span>
             PREV
          </button>
          <button onClick={handleNext} className="flex-[1.5] academic-gradient py-5 rounded-2xl flex items-center justify-center gap-3 text-white font-extrabold active:scale-95 transition-all shadow-lg text-base">
             NEXT STUDENT
             <span className="material-symbols-outlined font-bold">chevron_right</span>
          </button>
        </div>
      </main>

      <footer className="bg-white border-t border-[#e2e8f0] px-5 pt-4 pb-2 flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
           <div className="pl-2.5 text-slate-400">
              <span className="material-symbols-outlined text-xl font-bold">bolt</span>
           </div>
           <input 
             className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold placeholder:text-slate-400 py-2" 
             maxLength={3} 
             placeholder="Smart Jump (Matric ID)..." 
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && jumpTo()}
           />
           <button onClick={jumpTo} className="bg-[#00113a] text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest active:scale-95">Jump</button>
        </div>
        
        <nav className="flex justify-around items-center pt-1 pb-4">
           <div onClick={() => setActiveTab('Course Selection')} className="flex flex-col items-center gap-1 text-[#00113a] cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Grading</span>
           </div>
           <div onClick={() => setActiveTab('Template Upload')} className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-[#00113a] transition-colors">
              <span className="material-symbols-outlined">folder_shared</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Records</span>
           </div>
           <div onClick={() => setActiveTab('Audit Dashboard')} className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-[#00113a] transition-colors">
              <span className="material-symbols-outlined">monitoring</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Audit</span>
           </div>
        </nav>
      </footer>
    </div>
  );
}
