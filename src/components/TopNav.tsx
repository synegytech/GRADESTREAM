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
    <header className="bg-surface sticky top-0 z-40 w-full px-6 py-3 flex justify-between items-center bg-opacity-90 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-secondary font-headline text-sm font-medium">Course:</span>
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold font-headline tracking-wide uppercase">
            VUA-SEN 103
          </span>
        </div>

        {/* Entry Direction Toggle */}
        {showGridControls && setEntryMode && (
          <div className="flex items-center bg-surface-container rounded-lg p-1">
            <button
              onClick={() => setEntryMode('horizontal')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-all ${
                entryMode === 'horizontal' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:bg-surface-container-high font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
              <span>Horizontal</span>
            </button>
            <button
              onClick={() => setEntryMode('vertical')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-all ${
                entryMode === 'vertical' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:bg-surface-container-high font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              <span>Vertical</span>
            </button>
            <button
              onClick={() => setEntryMode('diagonal')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-all ${
                entryMode === 'diagonal' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:bg-surface-container-high font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">south_east</span>
              <span>Diagonal</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {showGridControls && toggleListening && (
          <div className="relative flex items-center justify-center group cursor-pointer" onClick={toggleListening}>
            {isListening && <div className="absolute w-10 h-10 bg-error/20 rounded-full animate-ping"></div>}
            <span
              className={`material-symbols-outlined relative z-10 p-2 rounded-full transition-colors ${
                isListening ? 'text-error bg-error-container/40' : 'text-secondary hover:bg-surface-container'
              }`}
            >
              mic
            </span>
            <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isListening ? 'Voice Input Active' : 'Enable Voice Input'}
            </span>
          </div>
        )}

        {handleExport && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 academic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mr-4"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export Grade Sheet</span>
          </button>
        )}

        <div className="flex items-center gap-4 border-l border-outline-variant/10 pl-8">
          <div className="relative group cursor-pointer">
            <span className="material-symbols-outlined text-secondary hover:bg-surface-container-low p-2 rounded-full transition-colors !normal-case">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface pointer-events-none"></span>
          </div>
          <span className="material-symbols-outlined text-secondary cursor-pointer hover:bg-surface-container-low p-2 rounded-full transition-colors !normal-case">
            settings
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary">Dr. Julian Thorne</p>
              <p className="text-[10px] text-secondary font-medium uppercase tracking-tighter">Senior Lecturer</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-lowest shadow-sm cursor-pointer active:scale-95 transition-transform">
              <img
                alt="Lecturer profile photo"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfFOcI4VH0EqUX2XOnAHJun1MEPRu4fMEdEH6mqF0ImIgv4vs2CFvldRufAO4oS0V5tqqIvT6ejS47BcCD6XUa8OL4MMPxoWonLjqwhxMXHBENO9dfA4rA6Sd2QbpjeSeQaOTMsLksCzM5J__aNzuvY7hsiyr0IhGfWxFRKqw6Kv2zDdCaYcUOK0UQPkGph4y3TuDCpSafzdJ1s5d1UbHHDiqxV68WKf6M9Dmt59yJOU9mDBnyBg6AZsuY4ZJhA5lJIH8X-NgXMJY"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
