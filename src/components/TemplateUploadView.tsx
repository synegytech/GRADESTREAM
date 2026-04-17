import React, { useRef, useState, useEffect } from 'react';

interface TemplateUploadViewProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  previewRows?: any[][];
  confirmMapping?: (mapping: any, headerRowIndex: number, dataStartRowIndex: number) => Promise<void>;
  isProcessing?: boolean;
}

const SYSTEM_ENTITIES = [
  { id: 'sn', label: 'S/N Index' },
  { id: 'name', label: 'Student Name' },
  { id: 'matricNo', label: 'Matric Number' },
  { id: 'theoryCA1', label: 'Theory CA 1' },
  { id: 'theoryCA2', label: 'Theory CA 2' },
  { id: 'theoryCA3', label: 'Theory CA 3' },
  { id: 'theorySubtotal', label: 'Theory CA Subtotal' },
  { id: 'practicalCA1', label: 'Practical CA 1' },
  { id: 'practicalCA2', label: 'Practical CA 2' },
  { id: 'practicalCA3', label: 'Practical CA 3' },
  { id: 'practicalSubtotal', label: 'Practical CA Subtotal' },
  { id: 'caTotal', label: 'CA Total (30%)' },
  { id: 'examTheory', label: 'Theory Exam (30%)' },
  { id: 'project', label: 'Project (10%)' },
  { id: 'handsOn', label: 'Hands-on (30%)' },
  { id: 'examSubtotal', label: 'Exams Sub Total (70%)' },
  { id: 'grandTotal', label: 'Grand Total (100%)' },
  { id: 'grade', label: 'Grade' },
];

export default function TemplateUploadView({ handleFileUpload, previewRows = [], confirmMapping, isProcessing }: TemplateUploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(-1);
  const [mappings, setMappings] = useState<Record<string, number>>({});

  // Auto-detect header row and initial mappings when previewRows changes
  useEffect(() => {
    if (previewRows.length > 0) {
      // Find row with most keywords
      let bestRowIndex = -1;
      let maxMatches = -1;

      previewRows.forEach((row, idx) => {
        const matches = row.filter(cell => {
          const s = String(cell || '').toLowerCase();
          return s.includes('name') || s.includes('matric') || s.includes('ca') || s.includes('test') || s.includes('exam');
        }).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestRowIndex = idx;
        }
      });

      if (bestRowIndex !== -1) {
        setHeaderRowIndex(bestRowIndex);
        const initialMapping: Record<string, number> = {};
        const headerRow = previewRows[bestRowIndex];

        headerRow.forEach((cell, colIdx) => {
          const val = String(cell || '').toLowerCase().trim();
          if (!val) return;
          
          SYSTEM_ENTITIES.forEach(entity => {
            const label = entity.label.toLowerCase();
            const id = entity.id.toLowerCase();
            
            // Intelligent Matching Strategy
            const isMatch = 
              val === id || 
              val === label ||
              (id === 'matricno' && (val.includes('matric') || val.includes('reg') || val.includes('no.'))) ||
              (id === 'name' && val.includes('name')) ||
              (id === 'sn' && (val === 'sn' || val === 's/n' || val === 'no' || val === 'id')) ||
              (id === 'examtheory' && (val.includes('exam') && (val.includes('theory') || val.includes('30%')))) ||
              (id === 'theorysubtotal' && (val.includes('subtotal') && (val.includes('theory') || val.includes('15%')))) ||
              (id === 'practicalsubtotal' && (val.includes('subtotal') && (val.includes('practical') || val.includes('15%')))) ||
              (id === 'catotal' && (val.includes('ca total') || val.includes('30%'))) ||
              (id === 'grandtotal' && (val.includes('grand') || val.includes('100%'))) ||
              (id === 'project' && (val.includes('project') || val.includes('10%'))) ||
              (id === 'handson' && (val.includes('hands') || val.includes('30%'))) ||
              (id === 'examsubtotal' && (val.includes('exam') && (val.includes('sub') || val.includes('70%')))) ||
              (id === 'grade' && val === 'grade');

            if (isMatch) {
              // Contextual Tie-breaking for CAs
              if (id.startsWith('theoryca') || id.startsWith('practicalca')) {
                const num = id.slice(-1);
                const isTheory = id.includes('theory');
                if ((val.includes(`ca${num}`) || val.includes(`ca ${num}`)) && 
                    (isTheory ? (val.includes('theory') || !val.includes('practical')) : val.includes('practical'))) {
                  initialMapping[entity.id] = colIdx + 1;
                }
              } else if (!initialMapping[entity.id]) {
                initialMapping[entity.id] = colIdx + 1;
              }
            }
          });
        });
        setMappings(initialMapping);
      }
    }
  }, [previewRows]);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const currentHeaders = headerRowIndex !== -1 ? previewRows[headerRowIndex] : [];

  return (
    <div className="p-8 max-w-7xl mx-auto font-body min-h-screen bg-surface">
      {/* Breadcrumbs & Title */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-secondary tracking-widest mb-3 font-headline uppercase">
            <span className="opacity-60">Dashboard</span>
            <span className="material-symbols-outlined text-[12px] opacity-40 !normal-case">chevron_right</span>
            <span className="text-primary">Upload Grading Template</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Upload Grading Template</h1>
          <p className="text-secondary mt-1 max-w-lg font-medium">
            Standardize your course evaluation by mapping your existing Excel spreadsheets to the GradeStream engine.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border border-outline-variant/30 text-secondary font-bold rounded-xl hover:bg-surface-container-low transition-colors text-sm uppercase tracking-wide">
            Cancel
          </button>
          <button 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm uppercase tracking-wide disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg !normal-case">analytics</span>
            {isProcessing ? 'Processing...' : 'Upload New File'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left Column: Status & Upload */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <section className="bg-surface-container-low p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/8 transition-colors"></div>
            <h2 className="text-xl font-black text-primary mb-8 font-headline tracking-tight relative z-10 flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Document Setup
            </h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-surface-container-highest -z-10"></div>
              
              <div className="flex items-center gap-5">
                <div className={`w-8 h-8 ${previewRows.length > 0 ? 'bg-on-tertiary-container' : 'bg-primary'} text-white rounded-full flex items-center justify-center font-bold z-10 shrink-0`}>
                   {previewRows.length > 0 ? <span className="material-symbols-outlined text-sm font-bold !normal-case">check</span> : '1'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">Upload Spreadsheet</p>
                  <p className="text-[11px] text-secondary">Accepted formats: .xlsx, .csv</p>
                </div>
                {previewRows.length > 0 && <span className="material-symbols-outlined text-on-tertiary-container text-2xl !normal-case" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
              </div>

              <div className="flex items-center gap-5">
                <div className={`w-8 h-8 ${previewRows.length > 0 ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-surface-container-high text-secondary opacity-40'} rounded-full flex items-center justify-center font-bold z-10 shrink-0 text-sm`}>2</div>
                <div className={`flex-1 ${previewRows.length === 0 ? 'opacity-40' : ''}`}>
                  <p className="text-sm font-bold text-primary">Header Mapping</p>
                  <p className="text-[11px] text-secondary">Sync your columns with our schema</p>
                </div>
              </div>

              <div className="flex items-center gap-5 opacity-40">
                <div className="w-8 h-8 bg-surface-container-high text-secondary rounded-full flex items-center justify-center font-bold z-10 shrink-0 text-sm font-headline">3</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">Validation & Confirm</p>
                  <p className="text-[11px] text-secondary">Ready for batch processing</p>
                </div>
              </div>
            </div>
          </section>

          {previewRows.length === 0 ? (
            <section 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className="bg-white border-2 border-dashed border-outline-variant/30 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center group hover:bg-surface-container-lowest hover:border-primary/40 transition-all cursor-pointer shadow-sm min-h-[400px]"
            >
              <div className="w-24 h-24 bg-surface-container-low rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-primary text-5xl !normal-case" style={{ fontWeight: 200 }}>description</span>
                <div className="absolute translate-x-3 translate-y-3 bg-primary w-8 h-8 rounded-lg flex items-center justify-center border-4 border-white">
                  <span className="material-symbols-outlined text-white text-lg !normal-case">upload</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-primary mb-2 font-headline">Drag and drop template</h3>
              <p className="text-secondary text-sm mb-8 max-w-[240px] leading-relaxed font-medium">
                Drop your class record here or browse to find the file in your local storage.
              </p>
              <button className="px-10 py-3 bg-white border border-outline-variant text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm shadow-sm active:scale-95">
                Browse Files
              </button>
            </section>
          ) : (
            <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-on-surface/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl">table_chart</span>
               </div>
               <h3 className="text-xl font-bold text-primary mb-4 font-headline">Sheet Preview</h3>
               <div className="space-y-4">
                  {previewRows.slice(0, 15).map((row, i) => (
                    <div key={i} onClick={() => setHeaderRowIndex(i)} className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${headerRowIndex === i ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/20 hover:bg-surface-container-low'} ${i < headerRowIndex ? 'opacity-30' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${headerRowIndex === i ? 'bg-primary text-white' : 'bg-secondary/20 text-secondary'}`}>{i + 1}</span>
                        <span className="font-bold text-secondary uppercase tracking-tight">{headerRowIndex === i ? 'Header Row' : i < headerRowIndex ? 'Redundant Row' : `Row ${i + 1}`}</span>
                      </div>
                      <div className="flex gap-2 overflow-hidden whitespace-nowrap opacity-60">
                         {row.slice(0, 5).map((c, j) => <span key={j} className="bg-surface-container-high px-2 py-0.5 rounded text-[10px]">{String(c || '')}</span>)}
                      </div>
                    </div>
                  ))}
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 mt-4">
                     <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">info</span>
                       Automatic offset
                     </p>
                     <p className="text-[10px] text-secondary mt-1 font-medium">Data processing will automatically start at <b>Row {headerRowIndex + 2}</b></p>
                  </div>
                  <p className="text-[10px] text-secondary/60 text-center italic mt-4">Select the row containing column headers</p>
               </div>
            </section>
          )}
        </div>

        {/* Right Column: Live Mapping Preview */}
        <div className="col-span-12 lg:col-span-7 h-full">
          <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-on-surface/5 overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-extrabold text-primary tracking-tight font-headline">Live Mapping Preview</h3>
                <p className="text-xs text-secondary font-medium tracking-wide mt-1">
                  {previewRows.length > 0 ? `Automatic detection results (${Object.keys(mappings).length * 10}% confidence)` : 'Waiting for file upload...'}
                </p>
              </div>
              <button onClick={() => setMappings({})} className="text-[11px] font-bold text-primary flex items-center gap-1.5 hover:bg-surface-container-low px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
                <span className="material-symbols-outlined text-lg !normal-case">refresh</span>
                Clear All
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
               {previewRows.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                    <span className="material-symbols-outlined text-8xl mb-4">settings_suggest</span>
                    <p className="font-bold">Upload a file to start mapping</p>
                 </div>
               ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary font-headline rounded-l-2xl">Excel Header</th>
                      <th className="py-5 px-4 text-center text-secondary">
                        <span className="material-symbols-outlined text-lg !normal-case">arrow_right_alt</span>
                      </th>
                      <th className="py-5 text-[10px] font-bold uppercase tracking-widest text-secondary font-headline">System Entity</th>
                      <th className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary font-headline text-right rounded-r-2xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {currentHeaders.map((header, colIdx) => {
                      if (!header && header !== 0) return null;
                      
                      const currentEntityId = Object.entries(mappings).find(([_, col]) => col === colIdx + 1)?.[0];
                      const isMatched = !!currentEntityId;

                      return (
                        <tr key={colIdx} className="group hover:bg-surface-container-lowest transition-colors">
                          <td className="py-5 pr-4">
                            <p className="font-bold text-primary text-sm font-headline truncate max-w-[140px]">{String(header)}</p>
                            <p className="text-[9px] text-secondary font-medium uppercase tracking-tighter opacity-40">Column {String.fromCharCode(65 + colIdx)}</p>
                          </td>
                          <td className="py-5 px-4 text-center text-outline/30 group-hover:text-primary/40 transition-colors">
                            <span className="material-symbols-outlined text-lg !normal-case">arrow_right_alt</span>
                          </td>
                          <td className="py-5">
                            <div className="relative group/select">
                              <select 
                                value={currentEntityId || ''}
                                onChange={(e) => {
                                  const newMappings = { ...mappings };
                                  // Remove old mapping if this entity was assigned elsewhere
                                  if (e.target.value) {
                                    Object.keys(newMappings).forEach(key => {
                                      if (key === e.target.value) delete newMappings[key];
                                    });
                                    newMappings[e.target.value] = colIdx + 1;
                                  } else {
                                    // If unselecting, remove the mapping for this column
                                    const keyToRemove = Object.entries(newMappings).find(([_, col]) => col === colIdx + 1)?.[0];
                                    if (keyToRemove) delete newMappings[keyToRemove];
                                  }
                                  setMappings(newMappings);
                                }}
                                className={`appearance-none w-full border-none rounded-xl py-2 pl-4 pr-10 text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer ${isMatched ? 'bg-primary/5 text-primary' : 'bg-surface-container-low text-secondary'}`}
                              >
                                <option value="">-- Ignore Column --</option>
                                {SYSTEM_ENTITIES.map(entity => (
                                  <option key={entity.id} value={entity.id}>{entity.label}</option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg text-primary/40 pointer-events-none group-focus-within/select:rotate-180 transition-transform !normal-case">expand_more</span>
                            </div>
                          </td>
                          <td className="py-5 text-right">
                            <span className={`${isMatched ? 'bg-tertiary-container/30 text-on-tertiary-container border border-on-tertiary-container/20' : 'bg-secondary-container/30 text-secondary border border-secondary/20'} text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider transition-all`}>
                              {isMatched ? 'MATCHED' : 'REVIEW'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               )}
            </div>

            <div className="p-8 pt-4 bg-white flex justify-end gap-3 border-t border-outline-variant/10">
              <button 
                disabled={!previewRows.length || isProcessing}
                onClick={() => confirmMapping?.(mappings, headerRowIndex, headerRowIndex + 1)}
                className="px-10 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all font-headline disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {isProcessing ? 'Finalizing...' : 'Confirm Mapping'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Guidelines Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-2xl border-l-[6px] border-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-primary text-2xl !normal-case" style={{ fontWeight: 600 }}>lightbulb</span>
          </div>
          <h4 className="font-extrabold text-primary mb-2 font-headline uppercase tracking-wide">Mapping Tip</h4>
          <p className="text-xs text-secondary leading-relaxed font-medium">Select the row in the sheet preview that contains your column titles to enable automatic detection.</p>
        </div>

        <div className="p-8 bg-white rounded-2xl border-l-[6px] border-on-tertiary-container shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-on-tertiary-container/10 rounded-xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-on-tertiary-container text-2xl !normal-case" style={{ fontWeight: 600 }}>verified_user</span>
          </div>
          <h4 className="font-extrabold text-primary mb-2 font-headline uppercase tracking-wide">Data Integrity</h4>
          <p className="text-xs text-secondary leading-relaxed font-medium">Mapped columns are validated against our grading schema to prevent errors in final calculations.</p>
        </div>

        <div className="p-8 bg-white rounded-2xl border-l-[6px] border-error shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-error text-2xl !normal-case" style={{ fontWeight: 600 }}>notification_important</span>
          </div>
          <h4 className="font-extrabold text-primary mb-2 font-headline uppercase tracking-wide">Row Limit</h4>
          <p className="text-xs text-secondary leading-relaxed font-medium">Bulk upload currently supports up to 2,000 students per session for performance stability.</p>
        </div>
      </section>
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.csv" className="hidden" />
    </div>
  );
}
