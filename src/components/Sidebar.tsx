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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg bg-transparent">auto_stories</span>
          </div>
          <span className="text-lg font-black text-primary">GradeStream</span>
        </div>
        <p className="font-headline uppercase tracking-widest text-[10px] font-bold text-secondary">The Digital Scholar</p>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <div
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 font-headline transition-all ${
                isActive
                  ? 'bg-surface-container-lowest text-primary rounded-l-xl shadow-sm ml-4'
                  : 'text-secondary hover:bg-surface-container/50'
              }`}
            >
              <span
                className="material-symbols-outlined !normal-case"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="uppercase tracking-wider text-[11px] font-bold">{tab.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Progress Widget (Shown conditionally when grading data is loaded) */}
      <div className={`mx-4 my-6 p-4 bg-surface-container-lowest/40 rounded-xl transition-opacity ${completionRate > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-headline uppercase tracking-wider text-[10px] font-bold text-secondary mb-4">Grading Progress</p>
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-surface-container-high"
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

      <div className="mt-auto pt-6 px-4 space-y-1">
        <div className="text-secondary px-4 py-3 hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-3 font-headline">
          <span className="material-symbols-outlined !normal-case">help</span>
          <span className="uppercase tracking-wider text-[11px] font-bold">Help Center</span>
        </div>
        <div className="text-secondary px-4 py-3 hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-3 font-headline">
          <span className="material-symbols-outlined !normal-case">logout</span>
          <span className="uppercase tracking-wider text-[11px] font-bold">Logout</span>
        </div>
      </div>
    </aside>
  );
}
