import fs from 'fs';
import ExcelJS from 'exceljs';

async function createDummyExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  
  // Add headers
  worksheet.getCell('A14').value = 1;
  worksheet.getCell('B14').value = 'John Doe';
  worksheet.getCell('C14').value = 'VUG/SEN/25/12345';
  worksheet.getCell('D14').value = 4;
  
  await workbook.xlsx.writeFile('dummy.xlsx');
}

async function test() {
  await createDummyExcel();
  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync('dummy.xlsx')]);
  formData.append('file', fileBlob, 'dummy.xlsx');

  const res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });

  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 100));
}

test();
