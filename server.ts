import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Smart-Mapper Logic
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0]; // Assume first sheet

    const students: any[] = [];
    // Based on the prompt and template structure
    const mapping = {
      theoryCA1: 4, // D
      theoryCA2: 5, // E
      theoryCA3: 6, // F
      practicalCA1: 8, // H
      practicalCA2: 9, // I
      practicalCA3: 10, // J
      examTheory: 13, // M
    };

    // Scan from row 14 onwards
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 14) {
        const sn = row.getCell(1).value;
        const name = row.getCell(2).value;
        const matricNo = row.getCell(3).value;

        if (matricNo) {
          students.push({
            sn,
            name: name?.toString() || '',
            matricNo: matricNo.toString(),
            rowNumber,
            scores: {
              theoryCA1: row.getCell(mapping.theoryCA1).value || '',
              theoryCA2: row.getCell(mapping.theoryCA2).value || '',
              theoryCA3: row.getCell(mapping.theoryCA3).value || '',
              practicalCA1: row.getCell(mapping.practicalCA1).value || '',
              practicalCA2: row.getCell(mapping.practicalCA2).value || '',
              practicalCA3: row.getCell(mapping.practicalCA3).value || '',
              examTheory: row.getCell(mapping.examTheory).value || '',
            }
          });
        }
      }
    });

    res.json({ students, mapping, originalFile: req.file.buffer.toString('base64') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// Audit Dashboard API
app.post('/api/audit', (req, res) => {
  const { students } = req.body;
  if (!students) {
    return res.status(400).json({ error: 'No students data provided' });
  }

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
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = JSON.parse(req.body.data);
    const students = data.students;
    const mapping = data.mapping;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    // Strip all formulas from row 14 downwards to prevent "Shared Formula" corruption.
    // This converts all formula clones to static values, fulfilling the "hard-coded" requirement.
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 14) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.value && typeof cell.value === 'object' && ('formula' in cell.value || 'sharedFormula' in cell.value)) {
            cell.value = (cell.value as any).result !== undefined ? (cell.value as any).result : null;
          }
        });
      }
    });

    students.forEach((student: any) => {
      const row = worksheet.getRow(student.rowNumber);
      
      const setCell = (col: number, val: any) => {
        if (val !== undefined && val !== null && val !== '') {
          row.getCell(col).value = val === 'ABS' ? 'ABS' : Number(val);
        } else {
          row.getCell(col).value = null;
        }
      };

      setCell(mapping.theoryCA1, student.scores.theoryCA1);
      setCell(mapping.theoryCA2, student.scores.theoryCA2);
      setCell(mapping.theoryCA3, student.scores.theoryCA3);
      setCell(mapping.practicalCA1, student.scores.practicalCA1);
      setCell(mapping.practicalCA2, student.scores.practicalCA2);
      setCell(mapping.practicalCA3, student.scores.practicalCA3);
      setCell(mapping.examTheory, student.scores.examTheory);

      // Calculate subtotals and totals
      const tCa1 = student.scores.theoryCA1 === 'ABS' ? 0 : (Number(student.scores.theoryCA1) || 0);
      const tCa2 = student.scores.theoryCA2 === 'ABS' ? 0 : (Number(student.scores.theoryCA2) || 0);
      const tCa3 = student.scores.theoryCA3 === 'ABS' ? 0 : (Number(student.scores.theoryCA3) || 0);
      const theorySubtotal = tCa1 + tCa2 + tCa3;
      row.getCell(7).value = theorySubtotal; // G

      const pCa1 = student.scores.practicalCA1 === 'ABS' ? 0 : (Number(student.scores.practicalCA1) || 0);
      const pCa2 = student.scores.practicalCA2 === 'ABS' ? 0 : (Number(student.scores.practicalCA2) || 0);
      const pCa3 = student.scores.practicalCA3 === 'ABS' ? 0 : (Number(student.scores.practicalCA3) || 0);
      const practicalSubtotal = pCa1 + pCa2 + pCa3;
      row.getCell(11).value = practicalSubtotal; // K

      const caTotal = theorySubtotal + practicalSubtotal;
      row.getCell(12).value = caTotal; // L

      const examTheory = student.scores.examTheory === 'ABS' ? 0 : (Number(student.scores.examTheory) || 0);
      const project = Number(row.getCell(14).value) || 0; // N
      const handsOn = Number(row.getCell(15).value) || 0; // O
      const examSubtotal = examTheory + project + handsOn;
      row.getCell(16).value = examSubtotal; // P

      const grandTotal = caTotal + examSubtotal;
      row.getCell(17).value = grandTotal; // Q

      // If all components are ABS, grade is ABS
      const allAbs = ['theoryCA1', 'theoryCA2', 'theoryCA3', 'practicalCA1', 'practicalCA2', 'practicalCA3', 'examTheory']
        .every(k => student.scores[k] === 'ABS' || student.scores[k] === undefined || student.scores[k] === null || student.scores[k] === '');
      
      const grade = calculateGrade(grandTotal, allAbs);

      row.getCell(18).value = grade; // R
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=GradeStream_Export.xlsx');
    res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export Excel file' });
  }
});

// Vite middleware
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  
  // Global error handler to prevent HTML error pages
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
