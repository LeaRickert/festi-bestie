---
type: Spec
title: "Spec: Schedule Export"
sources: [../src/pages/ExportPage.jsx, ../src/utils/exportSchedule.js, ../src/utils/csvImport.js]
description: Export one day of a schedule as a PNG image, and import and export acts as CSV.
tags: [export, csv]
timestamp: 2026-10-29T00:00:00Z
---

# Schedule Export

A user exports one day of a festival schedule as a PNG image to share. An
organizer can import and export acts as CSV.

## In Scope

- The page `/festival/:id/export`.
- The CSV helpers in `csvImport.js`.

## Out of Scope

- PDF output. The app does not make PDFs.
- A lock-screen image. The code exists in `exportSchedule.js` but nothing calls it.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let the user choose one day and one stage or more |
| FR-2 | Disable the export button until a day and a stage are chosen |
| FR-3 | Download a PNG that shows the chosen acts and the ratings of the user |
| FR-4 | Name the file `<festival>_<day>_schedule.png` with underscores for spaces |
| FR-5 | Show an error message when the image cannot be made |
| FR-6 | Read an act row from a CSV line, with the columns in a fixed order |
| FR-7 | Write acts to a CSV file |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-KJL8 | FR-1 | The user chooses "Friday" and the stage "Kinetic Field" | The preview shows only the Friday acts on that stage |
| TC-50UL | FR-2 | No stage is chosen | The export button is disabled |
| TC-5VLI | FR-3 | The user exports Friday with one rated act | The PNG contains that act and its rating |
| TC-BL3F | FR-4 | The festival is "EDC Orlando 2024" and the day is "Friday" | The file is `EDC_Orlando_2024_Friday_schedule.png` |
| TC-SKGA | FR-5 | `html2canvas` throws an error | The page shows an alert and the button is enabled again |
| TC-GFLF | FR-6 | A CSV line has an artist, a day and a stage | `parseCSVLineup` returns an act with those values |
| TC-878G | FR-7 | The user exports two acts | The CSV has a header line and two data lines |

### Known Issues

- `parseCSVLineup` gives each act a random start time. It also splits on commas, so a quoted comma breaks the row. FR-6 is partial.
- `exportActsToCSV` does not quote values.
- `ExportPage.jsx` has 834 lines. It copies `timeToMinutes` and the position helpers from `scheduleUtils.js`.
- `ExportPage` gets `acts` and `ratings` through router `state`. A page reload loses them. ??
- `exportSchedule.js` is legacy code.
