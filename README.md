# GradeStream

## Overview
**GradeStream** is a high-performance, web-based grading assistant designed specifically for university lecturers. It solves the tedious and error-prone process of manual grade entry by providing high-speed keyboard navigation, voice-to-text score entry, and automated Excel template injection. It ensures that raw scores are mapped perfectly to university-mandated templates without breaking formulas, headers, or formatting.

---

## Priority 1: Core Automation & Logic
**Status:** ✅ Available
* **Benefit:** Eliminates mathematical errors and broken Excel formulas.
* **Template Preservation Export:** Injects grades directly into the original Excel file, preserving all logos, headers, and styles while hard-coding final calculations to prevent coordinator formula errors.
* **Smart-Mapper Logic:** Automatically parses uploaded `.xlsx` templates and maps "Anchor Columns" (Name, Matric No, CA1-3, Exam) to exact coordinates.

## Rapid Input Systems
**Status:** ✅ Available
* **Benefit:** Eliminates the "scrolling search" for non-alphabetical script piles.
* **Multi-Directional Entry:** Supports Horizontal, Vertical, and Diagonal (Script-to-Grid) keyboard navigation for rapid data entry.
* **Smart Jump:** Instantly filter and jump to specific students using the last 3 digits of their Matric Number.

## Advanced Assistant Tools
* **Voice-to-Grid & Audio Confirmation:** ✅ Available
  * **Benefit:** Truly hands-free grading for physical scripts.
  * **Aural Loop (TTS):** Reads back confirmations (e.g., "Oti-ju, CA 1 set to 4.5. Next student is Emeka.") so lecturers don't have to look at the screen.
* **OCR Mark Sheet Scan:** ❌ *Not yet available*
  * **Planned:** Photo-to-Data conversion of handwritten rough sheets.
* **A "Crosshair" Highlight System:** ⚠️ *Partially Available / Planned*
  * **Current:** Features active cell highlighting.
  * **Planned:** Full row/column crosshair highlighting for better visual tracking across wide spreadsheets.

## Audit Dashboard Features
**Status:** ✅ Available
* Real-time validation of completion rates, missing scores, and maximum score limits (e.g., preventing a 6/5).
* Instantly flags "ABS" (Absent) entries and ensures they are calculated as `0` but exported as "ABS".

---

## Technical Specifications

* **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide React (Icons). Focuses on a highly responsive, fast, and accessible user experience.
* **Backend:** Node.js, Express.js, Multer (Memory Storage for file uploads), ExcelJS (for non-destructive Excel template parsing and injection).
* **Voice Engine:** Web Speech API (for Voice-to-Text and Text-to-Speech).
* **OCR Engine:** ❌ *Not yet available* (Planned for future integration).
* **Integrations:** ❌ *Not yet available* (Planned: Google Drive API for automated cloud backups and SMTP for direct "Email to Coordinator" functionality).

---

## Development Roadmap

| Phase | Milestone | Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **The Core Engine** | Excel parsing, Smart-Mapper, and non-destructive export. | ✅ Completed |
| **Phase 2** | **Input Interfaces** | Multi-directional entry, Smart Jump, and active cell tracking. | ✅ Completed |
| **Phase 3** | **The Auditor** | Real-time validation, missing score detection, and max score limits. | ✅ Completed |
| **Phase 4** | **Assistant Layer (Voice)** | Voice-to-Grid entry, fuzzy matching, and Aural Loop (TTS). | ✅ Completed |
| **Phase 5** | **Assistant Layer (OCR)** | OCR Mark Sheet Scan for handwritten rough sheets. | ⏳ Planned |
| **Phase 6** | **Integrations** | Google Drive backups & SMTP Email to Coordinator. | ⏳ Planned |

---

## Additional Considerations

* **Offline Support:** Progressive Web App (PWA) capabilities to allow grading without an active internet connection are planned.
* **LMS Integration:** Direct syncing with university Learning Management Systems (e.g., Moodle, Canvas) is planned to eliminate manual Excel uploads/downloads.
* **Best Practices:** 
  * Always run the **Audit** before exporting to catch any typos or missing scores. 
  * Use a headset microphone in noisy staff rooms for optimal voice recognition accuracy.
* **Contributions:** We welcome contributions! Please fork the repository, create a feature branch, and submit a pull request. Ensure all new features include robust error handling and maintain the strict "Preserve" logic for Excel exports.

## Contact Information
For questions, suggestions, or support, please reach out to:
**Email:** [synegytech@gmail.com](mailto:synegytech@gmail.com)
