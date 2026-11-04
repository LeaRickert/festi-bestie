---
type: Spec
title: "Spec: Schedule Export"
sources: [../src/pages/ExportPage.tsx, ../src/export, ../src/components/export, ../src/utils/dateUtils.ts]
description: Export one day of a schedule as a PNG lock screen wallpaper.
tests: [../src/export/scheduleHtml.test.ts, ../src/export/downloadPng.test.ts, ../src/utils/dateUtils.test.ts]
tags: [export]
timestamp: 2026-11-04T00:00:00Z
---

# Schedule Export

A user exports one day of a festival schedule as a PNG image and sets it as
the lock screen wallpaper of their phone. At the festival they see their day
with one glance, with no signal and no app. The CSV import and export of acts
is in `data-import.spec.md`.

### Definitions

- Clock zone: The top 25% of the image. The phone draws the clock and widgets over it, so the image leaves it empty.
- Header: One line in capitals, "<day> - <festival>", for example "FRIDAY - EDC ORLANDO 2026". The day is the weekday of the chosen day, found from the festival dates. When no festival date falls on that day, the header shows the day name of the acts.
- Image size: The CSS size of the phone screen (`screen.width` by `screen.height`) times `devicePixelRatio`. On a desktop browser, 393 by 852 times 3.

## In Scope

- The page `/festival/:slug/export`.
- The preview and the PNG made from it.

## Out of Scope

- PDF output. The app does not make PDFs.
- A tablet layout.
- Sharing the image with friends. Groups share ratings in the app (see `groups.spec.md`). The share menu of FR-16 is there to save the image to the phone.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let the user choose one day and one stage or more. Each stage is a chip that toggles on and off |
| FR-2 | Disable the export button until a day and a stage are chosen |
| FR-3 | Make a PNG that shows the chosen acts and the ratings of the user |
| FR-4 | Name the file `<festival>_<day>_schedule.png` with underscores for spaces |
| FR-5 | Show an error message when the image cannot be made |
| FR-6 | Load the festival, acts and ratings by the festival id, so a reload of the page keeps working |
| FR-7 | Draw each act once, at its start time, also when it starts after midnight, and show a preview built from the same HTML as the PNG |
| FR-8 | Draw each act with the rating style of `ratings.spec.md`, from the same style function as the time grid |
| FR-9 | Fit all chosen stages into the image width. Fit the time range to the chosen acts as in schedule-grid FR-5, and label each hour with the hour number only. Show act times as in schedule-grid FR-6 |
| FR-10 | Make the PNG the image size, so the wallpaper matches the phone screen pixel for pixel |
| FR-11 | Leave the clock zone empty. Draw the header directly above the stage names, and fill the rest of the image with the grid, down to a small empty margin at the bottom. The hour height follows from the time range |
| FR-12 | Show the clock zone as a faint outline in the preview only, not in the PNG |
| FR-13 | Lay out the page for a phone: the theme and header of the other pages, the day control of schedule-grid FR-2, the stage chips, the preview at full width, and a download button in the header. Show no summary panel |
| FR-14 | Draw the image on the page color `#051721` with the Inter font. The stage names (about 8 px) and the time column have no background |
| FR-15 | In a desktop browser, the download button downloads the PNG. In a phone browser, it opens a sheet with the PNG, which the user presses and holds to save it to the photo gallery |
| FR-16 | When the browser can share files, the sheet also has a "Save image" button that opens the share menu with the PNG. Closing the share menu keeps the sheet open and shows no error. When the share menu fails, the sheet hides the button and keeps the press and hold hint |
| FR-17 | Draw the image and the preview in the order of the "Later times on top" setting of schedule-grid FR-7 |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-KJL8 | FR-1 | The user chooses "Friday" and the stage "Kinetic Field" | The preview shows only the Friday acts on that stage |
| TC-50UL | FR-2 | No stage is chosen | The export button is disabled |
| TC-5VLI | FR-3 | The user exports Friday with one rated act | The PNG contains that act and its rating |
| TC-BL3F | FR-4 | The festival is "EDC Orlando 2024" and the day is "Friday" | The file is `EDC_Orlando_2024_Friday_schedule.png` |
| TC-SKGA | FR-5 | `html2canvas` throws an error | The page shows an alert and the button is enabled again |
| TC-3NMG | FR-6 | The user opens `/festival/:slug/export` directly or reloads it | The page shows the same day and stage choices as before |
| TC-HCJ0 | FR-7 | The first act starts at 1:00 PM and an act starts at 12:30 AM | The image draws the act once, 11.5 hours below the top of the grid |
| TC-YCYQ | FR-7 | An artist name contains an HTML tag | The tag is shown as text and does not run |
| TC-12UL | FR-8 | The user exports a day with an act rated 5 and an act rated 1 | The act rated 5 has a magenta border and a magenta 70% fill. The act rated 1 has a gray 40% border and no fill |
| TC-E76L | FR-9 | The chosen acts start at 2:00 PM and the last one ends at 1:00 AM | The image grid runs from 2 to 1, labeled "2" to "1" |
| TC-J3IS | FR-9 | An act starts at 2:30 PM and ends at 3:00 PM | The act shows "2:30-3" |
| TC-NETT | FR-10 | A phone with a 390 by 844 screen and a device pixel ratio of 3 exports | The PNG is 1170 by 2532 pixels |
| TC-JNGC | FR-10 | A desktop browser exports | The PNG is 1179 by 2556 pixels |
| TC-18TU | FR-11 | The user exports Friday of EDC Orlando 2026, which starts on 2026-11-06 | The top 25% is empty, and the header "FRIDAY - EDC ORLANDO 2026" is directly above the stage names |
| TC-5D4V | FR-12 | The preview shows the clock zone | The preview has the outline and the PNG does not |
| TC-FRTO | FR-13 | The screen is 375 px wide and the user opens the export page | The download button is in the header, the preview fills the width, and no summary panel shows |
| TC-0TDL | FR-14 | The user exports a day with 4 stages | The stage names and the time column have no background, on a `#051721` image |
| TC-X5AE | FR-14 | The user exports a day with a stage name that has letters below the baseline, such as "Quantum Valley" | The PNG shows the whole name, at the same place as in the preview |
| TC-76GK | FR-15 | The user agent is an iPhone, an Android phone or a desktop | The iPhone and the Android phone count as a phone, the desktop does not |
| TC-LNHT | FR-15 | A desktop browser exports | The PNG downloads and no sheet opens |
| TC-CPH9 | FR-15 | A phone browser exports and the user presses and holds the image | The sheet shows the PNG, and the browser menu offers to save it to the photo gallery |
| TC-RH6Q | FR-16 | A phone browser that can share files taps "Save image" | The share menu opens with the PNG and can save it to the photo gallery |
| TC-QGYR | FR-16 | A browser has no `navigator.share`, or cannot share files | The sheet has no "Save image" button and shows the press and hold hint |
| TC-YXDX | FR-16 | The user closes the share menu without saving | The sheet stays open and no error shows |
| TC-P505 | FR-17 | The setting is on and the user exports a day with acts from 2:00 PM to 1:00 AM | The image grid runs from 1 at the top to 2 at the bottom |
| TC-F98H | FR-17 | The setting is off and the user exports a day | The image grid has the earlier times on top |

### Known Issues

- To fit fewer stages, the user drops stages with FR-1. The image never scrolls sideways.
- An act without a start time or length is left out of the image.
- TC-SKGA, TC-3NMG, TC-LNHT, TC-CPH9, TC-RH6Q, TC-YXDX and TC-X5AE are checked by hand. The tests do not run a browser.
