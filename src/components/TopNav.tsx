import React from 'react';
import { EntryMode } from '../App'; // assume types will be moved/shared

interface TopNavProps {
  entryMode?: EntryMode;
  setEntryMode?: (mode: EntryMode) => void;
  isListening?: boolean;
  toggleListening?: () => void;
  showGridControls?: boolean;
  handleExport?: () => void;
}

export default function TopNav({
  entryMode = 'horizontal',
  setEntryMode,
  isListening = false,
  toggleListening,
  showGridControls = false,
  handleExport,
}: TopNavProps) {
  return (
    <>
      <header className="flex items-center justify-between w-full pl-8 lg:pl-72 pr-8 h-20 bg-surface font-headline font-semibold fixed top-0 right-0 z-40 shadow-sm shadow-black/5">
        <div className="flex items-center gap-6 flex-1">
           <div className="relative w-full max-w-md hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input className="w-full bg-surface-container-low border-none rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search students, IDs, or courses..." type="text"/>
          </div>
          <div className="h-6 w-[1px] bg-outline-variant/30 hidden md:block"></div>
          <div className="flex items-center gap-2 text-primary">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold">Course:</span>
            <span className="text-sm">CSC 402 - Advanced Algorithms</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-container-highest/50 p-1 rounded-full">
            <button className="p-2 hover:bg-white rounded-full transition-all text-secondary flex items-center justify-center"><span className="material-symbols-outlined !normal-case text-[20px]">notifications</span></button>
            <button className="p-2 hover:bg-white rounded-full transition-all text-secondary flex items-center justify-center"><span className="material-symbols-outlined !normal-case text-[20px]">help_outline</span></button>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30 hidden sm:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-primary leading-none">Dr. Alistair Vance</p>
              <p className="text-[10px] text-secondary">Senior Lecturer</p>
            </div>
            <img className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white" alt="Lecturer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLpm7TPlIi1gqW5b-cuE75rNNufMsAqwPvJahO63gv5mI2maJ0jnRw8H9yftPkw8TKlQNgmLAHDlEPgBydJPvOQHP51TjqHYvS-hoWsoy1muyGVOO9OCb8Ix-f0fCGH7oJhmN-48acEkoEOXskNrI_PRzylUIdMEkPdQ6__58Lr9Da6kKH80L8QQtCj3dEgV_qp5yB8P2TvDFG99slTo1rHjHTNPfFtQ0m_g4Co83fbZivDX53RYxXa2WskI_cSVg0SUoqQyyChG4"/>
          </div>
        </div>
      </header>

      {/* spacer to prevent content from going under the fixed header */}
      <div className="h-20 w-full shrink-0"></div>

      {/* Grid Controls Bar */}
      {showGridControls && (
        <div className="px-8 py-4 flex items-center justify-between bg-white/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-headline font-extrabold text-primary tracking-tight">Grade Entry Terminal</h2>
            {setEntryMode && entryMode && (
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider hidden sm:block">Entry Direction:</span>
                <div className="flex gap-1">
                  <button onClick={() => setEntryMode('horizontal')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${entryMode === 'horizontal' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}>Horizontal</button>
                  <button onClick={() => setEntryMode('vertical')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${entryMode === 'vertical' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}>Vertical</button>
                  <button onClick={() => setEntryMode('diagonal')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${entryMode === 'diagonal' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}>Diagonal</button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            {toggleListening && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-secondary hidden sm:block">Voice-to-Grid</span>
                <div className="relative flex items-center justify-center cursor-pointer" onClick={toggleListening}>
                  {isListening && <div className="absolute w-10 h-10 bg-error/20 rounded-full animate-ping"></div>}
                  <button className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-error text-white scale-105' : 'bg-surface-container-highest text-secondary hover:bg-white'}`}>
                    <span className="material-symbols-outlined !normal-case" style={{ fontVariationSettings: isListening ? "'FILL' 1" : "'FILL' 0" }}>mic</span>
                  </button>
                </div>
              </div>
            )}
            
            {handleExport && (
              <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-tertiary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
                <span className="material-symbols-outlined !normal-case">save</span>
                <span className="hidden sm:inline">Finalize Grades</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
