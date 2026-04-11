# GradeStream

## Overview
**GradeStream** is a high-performance, web-based grading assistant designed specifically for university lecturers. It solves the tedious and error-prone process of manual grade entry by providing high-speed keyboard navigation, voice-to-text score entry, and automated Excel template injection. It ensures that raw scores are mapped perfectly to university-mandated templates without breaking formulas, headers, or formatting.

## Current Status
* **Development Stage:** Beta / Production-Ready MVP.
* **Deployment:** Currently deployed and accessible via Google Cloud Run (hosted through Google AI Studio).

## Current Updates
* **Recent Changes:** 
  * Calibrated the Voice Parser with fuzzy matching to handle synonyms (e.g., "CA One", "Continuous Assessment 1", and "Test 1" all map correctly).
  * Implemented the "Aural Loop" using Text-to-Speech (TTS) to provide hands-free audio confirmation of entered grades.
  * Migrated backend to Node.js (Express) + ExcelJS for seamless full-stack deployment.
* **Bug Fixes:** 
  * Resolved the ExcelJS `Shared Formula master must exist above and or left of clone` error by safely stripping formulas before injection.
  * Fixed `Unexpected token '<'` JSON parsing errors by implementing a global Express error handler.
  * Corrected corrupted `.xlsx` blob downloads by switching to buffer streams (`writeBuffer()`).

## Features
**Existing Features:**
* **Smart-Mapper Logic:** Automatically parses uploaded `.xlsx` templates and maps "Anchor Columns" (Name, Matric No, CA1-3, Exam) to exact coordinates.
* **Multi-Directional Entry:** Supports Horizontal, Vertical, and Diagonal (Script-to-Grid) keyboard navigation for rapid data entry.
* **Smart Jump:** Instantly filter and jump to specific students using the last 3 digits of their Matric Number.
* **Voice Entry & ABS Handling:** Hands-free grading using the Web Speech API. Gracefully handles "ABS" (Absent) inputs for calculations while preserving the string in the final export.
* **Aural Loop (TTS):** Reads back confirmations (e.g., "Oti-ju, CA 1 set to 4.5. Next student is Emeka.") so lecturers don't have to look at the screen.
* **Audit Dashboard:** Real-time validation of completion rates, missing scores, and maximum score limits (e.g., preventing a 6/5).
* **Template Preservation Export:** Injects grades directly into the original Excel file, preserving all logos, headers, and styles while hard-coding final calculations to prevent coordinator formula errors.

**User Feedback:** 
* Lecturers report that voice entry significantly speeds up grading workflows. Initial feedback regarding accuracy in noisy staff rooms led to the recent implementation of fuzzy matching and TTS audio feedback.

## Future Updates
**Planned Features:**
* **Offline Support:** Progressive Web App (PWA) capabilities to allow grading without an active internet connection. Expected impact: Enables grading during commutes or in areas with poor connectivity.
* **LMS Integration:** Direct syncing with university Learning Management Systems (e.g., Moodle, Canvas). Expected impact: Eliminates the need for manual Excel uploads/downloads entirely.

**Improvements:** 
* Enhanced noise-cancellation filtering for the Web Speech API.
* Dynamic UI configuration for custom grading scales and custom column mappings.

## Recommendations
* **Best Practices:** 
  * Always run the **Audit** before exporting to catch any typos or missing scores. 
  * Use a headset microphone in noisy staff rooms for optimal voice recognition accuracy.
* **Contributions:** We welcome contributions! Please fork the repository, create a feature branch, and submit a pull request. Ensure all new features include robust error handling and maintain the strict "Preserve" logic for Excel exports.
* **Resources:** 
  * [ExcelJS Documentation](https://github.com/exceljs/exceljs)
  * [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  * [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Contact Information
For questions, suggestions, or support, please reach out to:
**Email:** [synegytech@gmail.com](mailto:synegytech@gmail.com)
