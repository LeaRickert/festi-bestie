---
type: Spec
title: "Spec: Schedule Export"
sources: [../src/pages/ExportPage.tsx, ../src/export, ../src/components/export]
description: Export one day of a schedule as a PNG image.
tests: [../src/export/scheduleHtml.test.ts]
tags: [export]
timestamp: 2026-10-29T00:00:00Z
---

# Schedule Export

A user exports one day of a festival schedule as a PNG image to share. The
CSV import and export of acts is in `data-import.spec.md`.

## In Scope

- The page `/festival/:id/export`.
- The preview and the PNG made from it.

## Out of Scope

- PDF output. The app does not make PDFs.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let the user choose one day and one stage or more |
| FR-2 | Disable the export button until a day and a stage are chosen |
| FR-3 | Download a PNG that shows the chosen acts and the ratings of the user |
| FR-4 | Name the file `<festival>_<day>_schedule.png` with underscores for spaces |
| FR-5 | Show an error message when the image cannot be made |
| FR-6 | Load the festival, acts and ratings by the festival id, so a reload of the page keeps working |
| FR-7 | Draw each act once, at its start time, also when it starts after midnight, and show a preview built from the same HTML as the PNG |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-KJL8 | FR-1 | The user chooses "Friday" and the stage "Kinetic Field" | The preview shows only the Friday acts on that stage |
| TC-50UL | FR-2 | No stage is chosen | The export button is disabled |
| TC-5VLI | FR-3 | The user exports Friday with one rated act | The PNG contains that act and its rating |
| TC-BL3F | FR-4 | The festival is "EDC Orlando 2024" and the day is "Friday" | The file is `EDC_Orlando_2024_Friday_schedule.png` |
| TC-SKGA | FR-5 | `html2canvas` throws an error | The page shows an alert and the button is enabled again |
| TC-3NMG | FR-6 | The user opens `/festival/:id/export` directly or reloads it | The page shows the same day and stage choices as before |
| TC-HCJ0 | FR-7 | An act starts at 12:30 AM | The image draws the act once, 575 px below the 1 PM line |
| TC-YCYQ | FR-7 | An artist name contains an HTML tag | The tag is shown as text and does not run |

### Known Issues

- The image has a fixed size (a phone, or a tablet by user agent), not the size of the screen. Phase 4 revisits it.
- An act without a start time or length is left out of the image.
- TC-SKGA and TC-3NMG are checked by hand. The tests do not run a browser.
