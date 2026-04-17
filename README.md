# GradeStream

## Overview
**GradeStream** is a high-performance, web-based grading assistant designed specifically for university lecturers. It combines heavy-lifting data logic with a premium **"Digital Scholar"** UI/UX to create an intuitive and beautiful experience. 

GradeStream eliminates the tedious and error-prone process of manual grade entry through:
- ⚡ **High-speed keyboard navigation**
- 🎙️ **Voice-to-text score entry**
- 🤖 **Intelligent Excel mapping & Template preservation**

---

## 🔥 Key Feature: The Intelligent Mapping Engine (v1.1.0)
The v1.1.0 update introduces the **Scholar's Smart-Mapper**, specifically optimized for complex university scorecards (like **Veritas University**).

*   **Anchor Detection**: Automatically identifies the grading header row, skipping redundant logos and metadata columns.
*   **Fuzzy Keyword Matching**: Intelligently pairs your Excel columns (e.g., "Theory CA1", "Subtotal", "Grade") to the GradeStream engine using academic synonym detection.
*   **Deep Hierarchy Support**: Now captures Theory/Practical breakdowns, Projects, and Hands-on scores natively.

---

## 🎨 Design Philosophy: "Digital Scholar"
GradeStream is built on the **Digital Scholar** design system—a visual language that prioritizes focus, clarity, and professionalism.

- **Tonal Depth**: We use "surface-container" shifts instead of harsh borders to define information hierarchy, creating a cleaner, "No-Line" ledger look.
- **Academic Typography**: Powered by **Manrope** (for headlines) and **Inter** (for UI), optimized for high-density spreadsheet legibility.
- **Glassmorphism**: Contextual menus and sticky headers use frosted-glass blurs to maintain focus within deep data structures.
- **HSL Harmony**: A curated palette of Deep Navy, Slate, and Lapis Blue ensures an experience that feels both technical and premium.

---

## 🚀 Rapid Input Systems
*   **Multi-Directional Entry**: Supports Horizontal, Vertical, and Diagonal (Script-to-Grid) keyboard navigation.
*   **Smart Jump**: Instantly filter and jump to specific students using the last 3 digits of their Matric Number.
*   **Aural Loop (TTS)**: The system reads back confirmations (e.g., "Oti-ju, CA 1 set to 4.5. Next student is Emeka.") so you never have to look away from your physical scripts.

---

## 🛠️ Reliability & Security
*   **Non-Destructive Export**: Injects grades directly into your original file, preserving all original branding, formulas, and styles.
*   **Bulletproof Binaries**: Optimized binary stream handling ensures `.xlsx` exports open instantly in Microsoft Excel without corruption warnings.
*   **Audit Dashboard**: Real-time validation flags missing scores, duplicates, and values exceeding maximum limits.

---

## 💻 Technical Specifications

*   **Frontend**: React 19, TypeScript, **Vite**, **Tailwind CSS v4**, Framer Motion.
*   **Backend**: Node.js, Express.js, **ExcelJS** (High-precision spreadsheet engine).
*   **API**: RESTful API for asynchronous template processing and binary stream generation.

---

## 🗺️ Development Roadmap

| Phase | Milestone | Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **The Core Engine** | Excel parsing, Smart-Mapper, and non-destructive export. | ✅ Completed |
| **Phase 2** | **Stability Sprint** | Smart Row Detection, Format Reconciliation, and TS Integrity. | ✅ Completed |
| **Phase 3** | **Design Maturity** | "Digital Scholar" UI, Tonal Architecture, and Manrope Integration. | ✅ Completed |
| **Phase 4** | **Assistant Layer** | Voice-to-Grid, fuzzy mapping, and Aural Loop (TTS). | ✅ Completed |
| **Phase 5** | **Cloud Layer** | Google Drive backups & SMTP Email to Coordinator. | ⏳ Planned |
| **Phase 6** | **The Vision** | OCR Mark Sheet Scan for handwritten rough sheets. | ⏳ Planned |

---

## 🛠️ Running Locally

1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Build Prod**: `npm run build`

---

## 📞 Contact & Contribution
We welcome contributions! Please fork the repository and submit a pull request.

**Email:** [synegytech@gmail.com](mailto:synegytech@gmail.com)
**Project Lead:** SynegyTech Engineering
