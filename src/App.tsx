import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import TemplateUploadView from './components/TemplateUploadView';
import AuditDashboardView from './components/AuditDashboardView';
import DesktopGridView from './components/DesktopGridView';
import MobileScriptFlipView from './components/MobileScriptFlipView';

export interface Student {
  sn: number;
  name: string;
  matricNo: string;
  rowNumber: number;
  scores: {
    theoryCA1?: number | 'ABS' | '';
    theoryCA2?: number | 'ABS' | '';
    theoryCA3?: number | 'ABS' | '';
    theorySubtotal?: number | 'ABS' | '';
    practicalCA1?: number | 'ABS' | '';
    practicalCA2?: number | 'ABS' | '';
    practicalCA3?: number | 'ABS' | '';
    practicalSubtotal?: number | 'ABS' | '';
    caTotal?: number | 'ABS' | '';
    examTheory?: number | 'ABS' | '';
    project?: number | 'ABS' | '';
    handsOn?: number | 'ABS' | '';
    examSubtotal?: number | 'ABS' | '';
    grandTotal?: number | 'ABS' | '';
    grade?: string;
    [key: string]: any;
  };
}

export type EntryMode = 'horizontal' | 'vertical' | 'diagonal';
export type Tab = 'Course Selection' | 'Template Upload' | 'Audit Dashboard';

export interface Column {
  id: string;
  label: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalFileBase64, setOriginalFileBase64] = useState<string | null>(null);
  const [originalFileFormat, setOriginalFileFormat] = useState<string>('xlsx');
  const [originalFileName, setOriginalFileName] = useState<string>('GradeStream_Export.xlsx');
  const [students, setStudents] = useState<Student[]>([]);
  const [mapping, setMapping] = useState<any>({
    sn: 1,
    name: 2,
    matricNo: 3,
    theoryCA1: 4,
    theoryCA2: 5,
    theoryCA3: 6,
    theorySubtotal: 7,
    practicalCA1: 8,
    practicalCA2: 9,
    practicalCA3: 10,
    practicalSubtotal: 11,
    caTotal: 12,
    examTheory: 13,
    project: 14,
    handsOn: 15,
    examSubtotal: 16,
    grandTotal: 17,
    grade: 18,
  });
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('horizontal');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCell, setActiveCell] = useState<{ rowId: string, colId: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<Tab>('Template Upload');
  const [isMobile, setIsMobile] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smart Jump: Filter students based on last 3 digits of Matric Number
  const filteredStudents = students.filter(s =>
    searchQuery ? s.matricNo.slice(-3).includes(searchQuery) : true
  );

  const [cols, setCols] = useState<Column[]>([
    { id: 'theoryCA1', label: 'Theory CA1' },
    { id: 'theoryCA2', label: 'Theory CA2' },
    { id: 'theoryCA3', label: 'Theory CA3' },
    { id: 'practicalCA1', label: 'Practical CA1' },
    { id: 'practicalCA2', label: 'Practical CA2' },
    { id: 'practicalCA3', label: 'Practical CA3' },
    { id: 'examTheory', label: 'Exam Theory' },
  ]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start(); // Keep listening if it was intentionally started
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isListening, students]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    console.log('Voice heard:', transcript);
    const regex = /set\s+(.*?)\s+for\s+matric\s+(\d+)\s+to\s+([\d.]+|abs)/i;
    const match = transcript.match(regex);

    if (match) {
      const colStr = match[1].toLowerCase();
      let col = '';
      let colLabel = '';

      const isPractical = colStr.includes('practical');

      if (colStr.includes('1') || colStr.includes('one')) {
        col = isPractical ? 'practicalCA1' : 'theoryCA1';
        colLabel = isPractical ? 'Practical CA 1' : 'CA 1';
      } else if (colStr.includes('2') || colStr.includes('two')) {
        col = isPractical ? 'practicalCA2' : 'theoryCA2';
        colLabel = isPractical ? 'Practical CA 2' : 'CA 2';
      } else if (colStr.includes('3') || colStr.includes('three')) {
        col = isPractical ? 'practicalCA3' : 'theoryCA3';
        colLabel = isPractical ? 'Practical CA 3' : 'CA 3';
      } else if (colStr.includes('exam')) {
        col = 'examTheory';
        colLabel = 'Exam';
      }

      if (!col) return;

      const id = match[2];
      const value = match[3].toUpperCase() === 'ABS' ? 'ABS' : parseFloat(match[3]);

      const studentIndex = students.findIndex(s => s.matricNo.endsWith(id));
      if (studentIndex !== -1) {
        const newStudents = [...students];
        newStudents[studentIndex].scores[col] = value;
        setStudents(newStudents);
        setActiveCell({ rowId: newStudents[studentIndex].matricNo, colId: col });

        const studentName = newStudents[studentIndex].name.split(' ')[0] || 'Student';
        let nextStudentName = 'End of list';
        if (studentIndex + 1 < students.length) {
          nextStudentName = students[studentIndex + 1].name.split(' ')[0] || 'Next student';
        }
        const speechText = `${studentName}, ${colLabel} set to ${value}. Next student is ${nextStudentName}.`;
        speak(speechText);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsProcessing(true);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'xlsx';
    setOriginalFileFormat(ext);
    setOriginalFileName(selectedFile.name);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setPreviewRows(data.previewRows);
      setOriginalFileBase64(data.originalFile);

      // Auto-switch to Template Upload is already active, we just show the preview now
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload and parse file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmMapping = async (finalMapping: any, headerRowIndex: number, dataStartRowIndex: number) => {
    if (!file) return;
    setIsProcessing(true);

    // Update mapping and dynamic columns
    setMapping(finalMapping);

    // Logic to sync grid columns with Excel headers
    const SYSTEM_ENTITIES = [
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

    const newCols = SYSTEM_ENTITIES
      .filter(entity => finalMapping[entity.id])
      .map(entity => {
        const colIdx = finalMapping[entity.id] - 1;
        const excelLabel = previewRows[headerRowIndex]?.[colIdx];
        return {
          id: entity.id,
          label: String(excelLabel || entity.label)
        };
      });

    setCols(newCols);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({
      mapping: finalMapping,
      headerRowIndex,
      dataStartRowIndex
    }));

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const data = await res.json();
      setStudents(data.students);
      setActiveTab('Course Selection');
    } catch (error) {
      console.error('Processing failed', error);
      alert('Failed to extract data with selected mapping.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!originalFileBase64 || students.length === 0) {
      alert('No data or original file available for export.');
      return;
    }
    setIsProcessing(true);
    try {
      // Decode base64 back to blob
      const byteCharacters = atob(originalFileBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      // Create exact file representation
      const fileObj = new File([byteArray], originalFileName || 'template.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Use DataTransfer to programmatically attach a File to a hidden form input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(fileObj);

      // Create hidden form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/export';
      form.enctype = 'multipart/form-data';
      form.style.display = 'none';

      // Attach file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name = 'file';
      fileInput.files = dataTransfer.files;
      form.appendChild(fileInput);

      // Attach JSON data input
      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'data';
      dataInput.value = JSON.stringify({ students, mapping });
      form.appendChild(dataInput);

      // Submit form natively - this triggers a clean, proper browser download
      document.body.appendChild(form);
      form.submit();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(form);
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export the grade sheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScoreChange = (matricNo: string, colId: string, value: string) => {
    const newStudents = [...students];
    const student = newStudents.find(s => s.matricNo === matricNo);
    if (student) {
      student.scores[colId] = value.toUpperCase() === 'ABS' ? 'ABS' : value;
      setStudents(newStudents);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, matricNo: string, colId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const studentIndex = filteredStudents.findIndex(s => s.matricNo === matricNo);
      const colIndex = cols.findIndex(c => c.id === colId);

      let nextStudentIndex = studentIndex;
      let nextColIndex = colIndex;

      if (entryMode === 'horizontal') {
        nextColIndex = colIndex + 1;
        if (nextColIndex >= cols.length) {
          nextColIndex = 0;
          nextStudentIndex = studentIndex + 1;
        }
      } else if (entryMode === 'vertical') {
        nextStudentIndex = studentIndex + 1;
      } else if (entryMode === 'diagonal') {
        if (colId === 'theoryCA1') {
          nextColIndex = cols.findIndex(c => c.id === 'theoryCA2');
        } else if (colId === 'theoryCA2') {
          nextColIndex = cols.findIndex(c => c.id === 'theoryCA1');
          nextStudentIndex = studentIndex + 1;
        } else {
          nextColIndex = colIndex + 1;
        }
      }

      if (nextStudentIndex < filteredStudents.length && nextColIndex < cols.length) {
        const nextStudent = filteredStudents[nextStudentIndex];
        const nextCol = cols[nextColIndex].id;
        setActiveCell({ rowId: nextStudent.matricNo, colId: nextCol });
        setTimeout(() => {
          document.getElementById(`cell-${nextStudent.matricNo}-${nextCol}`)?.focus();
        }, 0);
      }
    }
  };

  const runAudit = async () => {
    if (students.length === 0) return;
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });
      const data = await res.json();
      setAuditReport(data);
    } catch (error) {
      console.error('Audit failed', error);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-surface flex text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar */}
      {!isMobile && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} completionRate={auditReport?.completionRate || 0} />
      )}

      {/* Main Content */}
      <div className={`flex flex-col flex-1 w-full ${!isMobile ? 'ml-64' : ''} h-full relative`}>
        {(!isMobile || activeTab !== 'Course Selection') && (
          <TopNav
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            isListening={isListening}
            toggleListening={toggleListening}
            showGridControls={activeTab === 'Course Selection' && students.length > 0}
            handleExport={students.length > 0 ? handleExport : undefined}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'Template Upload' && (
              <TemplateUploadView
                handleFileUpload={handleFileUpload}
                previewRows={previewRows}
                confirmMapping={confirmMapping}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'Audit Dashboard' && (
              students.length > 0 ? (
                <AuditDashboardView students={students} auditReport={auditReport} runAudit={runAudit} />
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center h-full">
                  <div className="material-symbols-outlined text-gray-300 text-6xl mb-4">folder_off</div>
                  <h2 className="text-xl font-bold text-gray-400">No Data Available</h2>
                  <p className="text-gray-400">Please upload a template first.</p>
                  <button onClick={() => setActiveTab('Template Upload')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Go to Upload</button>
                </div>
              )
            )}

            {activeTab === 'Course Selection' && (
              students.length > 0 ? (
                isMobile ? (
                  <MobileScriptFlipView
                    students={filteredStudents}
                    cols={cols}
                    activeCell={activeCell}
                    setActiveCell={setActiveCell}
                    handleScoreChange={handleScoreChange}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isListening={isListening}
                    toggleListening={toggleListening}
                    entryMode={entryMode}
                    setEntryMode={setEntryMode}
                    setActiveTab={setActiveTab}
                  />
                ) : (
                  <DesktopGridView
                    students={filteredStudents}
                    cols={cols}
                    activeCell={activeCell}
                    setActiveCell={setActiveCell}
                    handleScoreChange={handleScoreChange}
                    handleKeyDown={handleKeyDown}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center h-full">
                  <div className="material-symbols-outlined text-gray-300 text-6xl mb-4">account_circle_off</div>
                  <h2 className="text-xl font-bold text-gray-400">No Course Loaded</h2>
                  <p className="text-gray-400">Upload a spreadsheet to view the grading grid.</p>
                  <button onClick={() => setActiveTab('Template Upload')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Go to Upload</button>
                </div>
              )
            )}
          </div>

          {/* Sticky Footer Status Bar */}
          {activeTab === 'Course Selection' && students.length > 0 && (
            <footer className="bg-primary text-white px-8 py-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest shrink-0 z-50">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-error animate-pulse' : 'bg-tertiary-fixed animate-pulse'}`}></span>
                  <span>System Live: {isListening ? 'Listening via Voice' : 'Listening for input'}</span>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <span className="text-white/60">Class Stats:</span>
                  <span>Avg. 74.2%</span>
                  <span>•</span>
                  <span>Failing: 2</span>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-white/10 px-3 py-1 rounded hidden sm:block">Autosave: Just now</div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm !normal-case">wifi</span>
                  <span>Synced</span>
                </div>
              </div>
            </footer>
          )}

          {/* Contextual Info Floating Card */}
          {activeTab === 'Course Selection' && students.length > 0 && !isMobile && (
            <div className="fixed bottom-16 right-12 w-64 bg-surface-container-lowest/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-transform pointer-events-none z-50">
              <h4 className="font-headline font-extrabold text-primary mb-2 text-sm">Grading Protocol</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium normal-case">
                  Please ensure all CA marks are normalized to the 5% weighting as per the department board's directives for 400-level courses.
              </p>
              <div className="mt-4 flex items-center gap-2 text-tertiary-container font-black">
                <span className="material-symbols-outlined text-sm !normal-case" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Template Verified</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
