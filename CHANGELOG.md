# Changelog

All notable changes to the **GradeStream** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-11

### Added
- **Intelligent Auto-Mapping**: New engine that automatically detects anchor header rows, skipping redundant university metadata (logos, titles).
- **Veritas University Support**: Expanded grading schema to support Theory/Practical CA subtotals, Projects, and Hands-on scores.
- **"Digital Scholar" Design System**: 
  - Implemented tonal architecture using `surface-container` shifts instead of borders.
  - Added academic gradients (Lapis to Navy) for primary actions.
  - Integrated "Glassmorphism" for sticky headers and overlays.

### Changed
- **Direct Export Engine**: Refactored the binary transmission layer for reliable Excel downloads.
- **Smart Grid Synchronization**: Grid columns are now generated dynamically based on active template mappings.
- **UI Polishing**: Switched default typography to Manrope/Inter for a professional, academic feel.

### Fixed
- **Binary Format Mismatch**: Resolved "Corrupted File" warnings in Microsoft Excel by enforcing `.xlsx` extension reconciliation.
- **Filename Retention**: Exported files now retain their original names appended with `_Graded`.
- **TypeScript Errors**: Fixed the missing `Column` interface in the main application state.
- **Dev Server Stability**: Optimized the `package.json` dev script with correct path watching for `server.ts`.

---

## [1.0.0] - 2026-04-01

### Added
- **Core Grading Engine**: Multi-directional entry (Horizontal, Vertical, Diagonal).
- **Excel Mapping**: Initial "Smart-Mapper" logic for template parsing.
- **Voice-to-Text**: Hands-free score entry using Web Speech API.
- **Audit Dashboard**: Real-time validation and completion tracking.
- **Preserved Export**: Injecting data into original templates without destroying formulas.

[1.1.0]: https://github.com/synegytech/gradestream/releases/tag/v1.1.0
[1.0.0]: https://github.com/synegytech/gradestream/releases/tag/v1.0.0
