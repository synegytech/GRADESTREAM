import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Mic, Activity, Search, Table } from 'lucide-react';

interface Student {
  sn: number;
  name: string;
  matricNo: string;
  rowNumber: number;
  scores: {
    theoryCA1?: number | 'ABS' | '';
    theoryCA2?: number | 'ABS' | '';
    theoryCA3?: number | 'ABS' | '';
    practicalCA1?: number | 'ABS' | '';
    practicalCA2?: number | 'ABS' | '';
    practicalCA3?: number | 'ABS' | '';
    examTheory?: number | 'ABS' | '';
    [key: string]: any;
  };
}

type EntryMode = 'horizontal' | 'vertical' | 'diagonal';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalFileBase64, setOriginalFileBase64] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [mapping, setMapping] = useState<any>(null);
  const [entryMode, setEntryMode] = useState<EntryMode>('horizontal');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCell, setActiveCell] = useState<{ rowId: string, colId: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Smart Jump: Filter students based on last 3 digits of Matric Number
  const filteredStudents = students.filter(s => 
    searchQuery ? s.matricNo.slice(-3).includes(searchQuery) : true
  );

  const cols = [
    { id: 'theoryCA1', label: 'Theory CA1' },
    { id: 'theoryCA2', label: 'Theory CA2' },
    { id: 'theoryCA3', label: 'Theory CA3' },
    { id: 'practicalCA1', label: 'Practical CA1' },
    { id: 'practicalCA2', label: 'Practical CA2' },
    { id: 'practicalCA3', label: 'Practical CA3' },
    { id: 'examTheory', label: 'Exam Theory' },
  ];

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

  // Voice Parsing Logic
  const handleVoiceCommand = (transcript: string) => {
    console.log('Voice heard:', transcript);
    
    // Fuzzy regex: "set <column synonyms> for matric <id> to <score>"
    // Handles "CA 1", "CA One", "Continuous Assessment 1", "Test 1", etc.
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
      
      // Find student by last digits
      const studentIndex = students.findIndex(s => s.matricNo.endsWith(id));
      if (studentIndex !== -1) {
        const newStudents = [...students];
        newStudents[studentIndex].scores[col] = value;
        setStudents(newStudents);
        setActiveCell({ rowId: newStudents[studentIndex].matricNo, colId: col });
        
        // Aural Loop (TTS)
        // Extract first name for a friendly response
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

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} ${errText.substring(0, 100)}`);
      }
      
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
        setMapping(data.mapping);
        setOriginalFileBase64(data.originalFile);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload and parse file.');
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

  // Diagonal Logic & Multi-Platform Entry Logic
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
        // CA1 (Student A) -> CA2 (Student A) -> CA1 (Student B)
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

  const exportData = async () => {
    if (!file && !originalFileBase64) return;
    
    // We need to send the original file back to the server to modify it.
    // Since we have the file object, we can just send it.
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      // Fallback if file object is lost but we have base64
      const res = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${originalFileBase64}`);
      const blob = await res.blob();
      formData.append('file', blob, 'template.xlsx');
    }
    
    formData.append('data', JSON.stringify({ students, mapping }));

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Export failed on server');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GradeStream_Grades_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Table className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">GradeStream</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Template
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx"
              className="hidden"
            />
            {students.length > 0 && (
              <>
                <button
                  onClick={runAudit}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Audit
                </button>
                <button
                  onClick={exportData}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!students.length ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200 border-dashed">
            <Table className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data loaded</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a university raw score sheet to get started.</p>
            <div className="mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload .xlsx
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Mode:</span>
                  <select
                    value={entryMode}
                    onChange={(e) => setEntryMode(e.target.value as EntryMode)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="diagonal">Diagonal (CA1 &rarr; CA2)</option>
                  </select>
                </div>
                <button
                  onClick={toggleListening}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                    isListening ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mic className={`h-4 w-4 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
                  {isListening ? 'Listening...' : 'Voice Entry'}
                </button>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Smart Jump (Last 3 digits)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                />
              </div>
            </div>

            {/* Audit Report */}
            {auditReport && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">{auditReport.completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Missing Scores</p>
                    <p className="text-2xl font-bold text-red-600">{auditReport.missingScores.length} students</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-3">
                    <p className="text-sm text-gray-500 mb-2">Validation Report</p>
                    {auditReport.validationReport.length === 0 ? (
                      <p className="text-sm text-green-600">All scores are within valid ranges.</p>
                    ) : (
                      <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                        {auditReport.validationReport.map((msg: string, i: number) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Matric No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {cols.map(col => (
                        <th key={col.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.matricNo} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                          {student.matricNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.name}
                        </td>
                        {cols.map(col => {
                          const isActive = activeCell?.rowId === student.matricNo && activeCell?.colId === col.id;
                          return (
                            <td key={col.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                id={`cell-${student.matricNo}-${col.id}`}
                                type="text"
                                value={student.scores[col.id] || ''}
                                onChange={(e) => handleScoreChange(student.matricNo, col.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, student.matricNo, col.id)}
                                onFocus={() => setActiveCell({ rowId: student.matricNo, colId: col.id })}
                                className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  isActive ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-300'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
