import React from 'react';

type Tab = 'Course Selection' | 'Template Upload' | 'Audit Dashboard';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  completionRate?: number;
}

export default function Sidebar({ activeTab, setActiveTab, completionRate = 0 }: SidebarProps) {
  const tabs: { label: Tab; icon: string }[] = [
    { label: 'Course Selection', icon: 'school' },
    { label: 'Template Upload', icon: 'cloud_upload' },
    { label: 'Audit Dashboard', icon: 'analytics' },
  ];

  const strokeDashoffset = 251.2 - (251.2 * completionRate) / 100;

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-8 px-4 bg-surface-container-low w-64 border-r-0 font-manrope text-base font-medium z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">GradeStream</h1>
          <p className="text-xs text-secondary opacity-70 uppercase tracking-widest font-bold">The Digital Scholar</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <div
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 rounded-xl ${
                isActive
                  ? 'text-primary font-bold bg-white shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined !normal-case">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Progress Widget (Shown conditionally when grading data is loaded) */}
      <div className={`mx-2 my-6 p-4 bg-white rounded-xl shadow-sm transition-opacity ${completionRate > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-headline uppercase tracking-wider text-[10px] font-bold text-secondary mb-4">Grading Progress</p>
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-surface-container"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-tertiary-container"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeWidth="8"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-primary">{Math.round(completionRate)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-1 pt-6 border-t border-outline-variant/20">
        <button className="w-full mb-4 py-3 px-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95">
          <span className="material-symbols-outlined !normal-case">add</span>
          <span className="text-sm">New Grading Session</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary rounded-lg cursor-pointer transition-colors">
          <span className="material-symbols-outlined !normal-case text-lg">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary rounded-lg cursor-pointer transition-colors">
          <span className="material-symbols-outlined !normal-case text-lg">help</span>
          <span className="text-sm font-medium">Support</span>
        </div>
      </div>
    </aside>
  );
}
