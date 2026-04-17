import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(cors({
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage() });

// Helper to load workbook regardless of format
async function loadWorkbook(file: Express.Multer.File) {
  const workbook = new ExcelJS.Workbook();
  const isCsv = file.originalname.toLowerCase().endsWith('.csv');
  
  if (isCsv) {
    // For CSV, read from buffer as string
    await workbook.csv.readContents(file.buffer.toString());
  } else {
    // For XLSX, load from buffer
    await workbook.xlsx.load(file.buffer);
  }
  return workbook;
}

// 1. Initial Upload -> Extract Preview Rows
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log(`[API] Received upload request: ${req.file?.originalname}`);
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = await loadWorkbook(req.file);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error('No worksheet found in file');
    }

    const previewRows: any[][] = [];
    // Get first 20 rows for preview/header selection
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber <= 20) {
        const rowData: any[] = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          // Flatten cell values (might be objects for dates/formulas)
          const val = cell.value;
          if (val && typeof val === 'object' && 'result' in val) {
            rowData.push(val.result);
          } else if (val && typeof val === 'object' && 'text' in val) {
             rowData.push(val.text);
          } else {
            rowData.push(val);
          }
        });
        previewRows.push(rowData);
      }
    });

    console.log(`[API] Extracted ${previewRows.length} preview rows`);
    res.json({ 
      previewRows, 
      originalFile: req.file.buffer.toString('base64'),
      filename: req.file.originalname 
    });
  } catch (error: any) {
    console.error('[API ERROR] /api/upload:', error);
    res.status(500).json({ error: `Failed to process file preview: ${error.message}` });
  }
});

// 2. Confirm Mapping -> Extract Students based on Map
app.post('/api/process', upload.single('file'), async (req, res) => {
  console.log('[API] Processing file with mapping...');
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  
  try {
    const { mapping, headerRowIndex, dataStartRowIndex } = JSON.parse(req.body.data);
    const workbook = await loadWorkbook(req.file);
    const worksheet = workbook.worksheets[0];

    const students: any[] = [];
    
    worksheet.eachRow((row, rowNumber) => {
      // Data usually starts right after headers or at a specific offset
      if (rowNumber >= (dataStartRowIndex || (headerRowIndex + 2))) {
        const student: any = {
          sn: row.getCell(Number(mapping.sn) || 1).value,
          name: row.getCell(Number(mapping.name) || 2).value?.toString() || '',
          matricNo: row.getCell(Number(mapping.matricNo) || 3).value?.toString() || '',
          rowNumber,
          scores: {}
        };

        if (student.matricNo) {
          const scoreKeys = [
            'theoryCA1', 'theoryCA2', 'theoryCA3', 'theorySubtotal',
            'practicalCA1', 'practicalCA2', 'practicalCA3', 'practicalSubtotal',
            'caTotal', 'examTheory', 'project', 'handsOn', 
            'examSubtotal', 'grandTotal', 'grade'
          ];
          
          scoreKeys.forEach(key => {
            if (mapping[key] !== undefined) {
              const val = row.getCell(Number(mapping[key])).value;
              // Extract result if it's a formula
              const finalVal = (val && typeof val === 'object' && 'result' in val) ? val.result : val;
              student.scores[key] = finalVal !== null && finalVal !== undefined ? finalVal : '';
            }
          });

          students.push(student);
        }
      }
    });

    console.log(`[API] Successfully processed ${students.length} students`);
    res.json({ students, mapping, originalFile: req.file.buffer.toString('base64') });
  } catch (error: any) {
    console.error('[API ERROR] /api/process:', error);
    res.status(500).json({ error: `Failed to extract data: ${error.message}` });
  }
});

// Audit Dashboard API
app.post('/api/audit', (req, res) => {
  const { students } = req.body;
  if (!students) return res.status(400).json({ error: 'No students data provided' });

  let totalCells = 0;
  let filledCells = 0;
  const missingScores: string[] = [];
  const validationReport: string[] = [];

  const maxScores: Record<string, number> = {
    theoryCA1: 5,
    theoryCA2: 5,
    theoryCA3: 5,
    practicalCA1: 5,
    practicalCA2: 5,
    practicalCA3: 5,
    examTheory: 30,
  };

  students.forEach((student: any) => {
    let hasMissing = false;
    Object.keys(maxScores).forEach((key) => {
      totalCells++;
      const val = student.scores[key];
      if (val !== undefined && val !== null && val !== '') {
        filledCells++;
        if (val !== 'ABS') {
          const numVal = Number(val);
          if (numVal > maxScores[key]) {
            validationReport.push(`Student ${student.matricNo} has invalid score ${val} for ${key} (Max: ${maxScores[key]})`);
          }
        }
      } else {
        hasMissing = true;
      }
    });

    if (hasMissing) {
      missingScores.push(student.name || student.matricNo);
    }
  });

  res.json({
    completionRate: totalCells > 0 ? (filledCells / totalCells) * 100 : 0,
    missingScores,
    validationReport
  });
});

function calculateGrade(grandTotal: number, allAbs: boolean): string {
  if (allAbs) return 'ABS';
  if (grandTotal >= 70) return 'A';
  if (grandTotal >= 60) return 'B';
  if (grandTotal >= 50) return 'C';
  if (grandTotal >= 45) return 'D';
  if (grandTotal >= 40) return 'E';
  return 'F';
}

// Final Export Sequence
app.post('/api/export', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const data = JSON.parse(req.body.data);
    const students = data.students;
    const mapping = data.mapping;

    const workbook = await loadWorkbook(req.file);
    const worksheet = workbook.worksheets[0];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= (data.dataStartRowIndex || 14)) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.value && typeof cell.value === 'object' && ('formula' in cell.value || 'sharedFormula' in cell.value)) {
            cell.value = (cell.value as any).result !== undefined ? (cell.value as any).result : null;
          }
        });
      }
    });

    students.forEach((student: any) => {
      const row = worksheet.getRow(student.rowNumber);
      
      const setCell = (col: string | number, val: any) => {
        if (!col) return;
        const colNum = Number(col);
        if (val !== undefined && val !== null && val !== '') {
          row.getCell(colNum).value = val === 'ABS' ? 'ABS' : Number(val);
        } else {
          row.getCell(colNum).value = null;
        }
      };

      setCell(mapping.theoryCA1, student.scores.theoryCA1);
      setCell(mapping.theoryCA2, student.scores.theoryCA2);
      setCell(mapping.theoryCA3, student.scores.theoryCA3);
      setCell(mapping.practicalCA1, student.scores.practicalCA1);
      setCell(mapping.practicalCA2, student.scores.practicalCA2);
      setCell(mapping.practicalCA3, student.scores.practicalCA3);
      setCell(mapping.examTheory, student.scores.examTheory);

      const tCa1 = student.scores.theoryCA1 === 'ABS' ? 0 : (Number(student.scores.theoryCA1) || 0);
      const tCa2 = student.scores.theoryCA2 === 'ABS' ? 0 : (Number(student.scores.theoryCA2) || 0);
      const tCa3 = student.scores.theoryCA3 === 'ABS' ? 0 : (Number(student.scores.theoryCA3) || 0);
      const theorySubtotal = tCa1 + tCa2 + tCa3;
      if (mapping.theorySubtotal) row.getCell(Number(mapping.theorySubtotal)).value = theorySubtotal;

      const pCa1 = student.scores.practicalCA1 === 'ABS' ? 0 : (Number(student.scores.practicalCA1) || 0);
      const pCa2 = student.scores.practicalCA2 === 'ABS' ? 0 : (Number(student.scores.practicalCA2) || 0);
      const pCa3 = student.scores.practicalCA3 === 'ABS' ? 0 : (Number(student.scores.practicalCA3) || 0);
      const practicalSubtotal = pCa1 + pCa2 + pCa3;
      if (mapping.practicalSubtotal) row.getCell(Number(mapping.practicalSubtotal)).value = practicalSubtotal;

      const caTotal = theorySubtotal + practicalSubtotal;
      if (mapping.caTotal) row.getCell(Number(mapping.caTotal)).value = caTotal;

      const examTheory = student.scores.examTheory === 'ABS' ? 0 : (Number(student.scores.examTheory) || 0);
      const project = Number(row.getCell(mapping.project || 14).value) || 0;
      const handsOn = Number(row.getCell(mapping.handsOn || 15).value) || 0;
      const examSubtotal = examTheory + project + handsOn;
      if (mapping.examSubtotal) row.getCell(Number(mapping.examSubtotal)).value = examSubtotal;

      const grandTotal = caTotal + examSubtotal;
      if (mapping.grandTotal) row.getCell(Number(mapping.grandTotal)).value = grandTotal;

      const allAbs = ['theoryCA1', 'theoryCA2', 'theoryCA3', 'practicalCA1', 'practicalCA2', 'practicalCA3', 'examTheory']
        .every(k => student.scores[k] === 'ABS' || student.scores[k] === undefined || student.scores[k] === null || student.scores[k] === '');
      
      const grade = calculateGrade(grandTotal, allAbs);
      if (mapping.grade) row.getCell(Number(mapping.grade)).value = grade;
    });

    let safeBaseName = (req.file.originalname || 'GradeStream_Export').replace(/\.[^/.]+$/, "");
    safeBaseName = safeBaseName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "GradeStream_Output";
    const safeFileName = `${safeBaseName}_Graded.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('[API ERROR] /api/export:', error);
    res.status(500).json({ error: 'Failed to export Excel file' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
