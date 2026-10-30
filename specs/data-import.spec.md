---
type: Spec
title: "Spec: Festival Data Import and Export"
sources: [../data, ../supabase/schemas]
tests: []
description: DRAFT. Master festival data in CSV and YAML files, with scripts that load them into the database and back.
tags: [data, csv, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Festival Data Import and Export

DRAFT. The scripts do not exist yet. The folder `data/` holds the master data
of each festival. A script loads it into the database. Another script writes
the database back to the same files, so the files also work as a backup. Users
edit the files with Excel or other tools.

### Definitions

- Slug: The folder name of a festival, for example `edc-orlando-2025`. It is also the `slug` column of `festivals`.
- Act key: The pair `artist` and `day` inside one festival. It must be unique.
- Dry run: A run that checks the files and prints the changes but writes nothing.

## In Scope

- `data/<slug>/festival.yaml` and `data/<slug>/acts.csv`.
- The scripts `data:import` and `data:export`.
- The unique constraints `festivals.slug` and `acts (festival_id, artist, day)`.

## Out of Scope

- User ratings and group data. They are not master data.
- `avg_rating`. The database calculates it.
- The upload of a CSV file in the app. ??

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Read one festival from `festival.yaml` and `acts.csv` in the folder that has its slug |
| FR-2 | Accept a CSV file with a UTF-8 byte order mark and with quoted commas |
| FR-3 | Accept `start_time` only as text in the form `HH:MM`, or empty |
| FR-4 | Reject a file that has a bad value, and report the row number and the column |
| FR-5 | Reject a file that has the same act key twice |
| FR-6 | Make no change to the database in a dry run, and print the acts to add, change and remove |
| FR-7 | Add a new act and change an existing act by its act key, and keep its ratings |
| FR-8 | Do not remove an act that is missing from the file unless the user passes `--prune` |
| FR-9 | Write the database to the same files, with acts sorted by day and then by artist |
| FR-10 | Target the local database or the production database with `--env`, and ask for a confirmation before a write to production |
| FR-11 | Run an import that was written by an export, and make no change |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-ALBI | FR-1 | The folder `edc-orlando-2025` has both files | The import reads the festival "EDC Orlando 2025" and its acts |
| TC-NM0K | FR-1 | The folder has no `acts.csv` | The import stops and names the missing file |
| TC-Q291 | FR-2 | The CSV starts with a byte order mark and has the artist "Smith, John" in quotes | The import reads the artist as "Smith, John" |
| TC-0U5F | FR-3 | The `start_time` is "21:30" | The import stores the time 21:30 |
| TC-ZYLF | FR-3 | The `start_time` is "0.9167" | The import stops and reports the row and the column `start_time` |
| TC-D57O | FR-4 | The `day` column is empty on row 7 | The import stops and reports row 7, column `day` |
| TC-5IH0 | FR-5 | Two rows have the artist "Diplo" and the day "Friday" | The import stops and reports both rows |
| TC-RW98 | FR-6 | The user runs the import with `--dry-run` | The database is unchanged and the output lists the changes |
| TC-5F2P | FR-7 | The file changes the stage of an act that has one rating | The act has the new stage and the rating is still there |
| TC-JHUG | FR-8 | The database has an act that the file does not have | The act stays in the database |
| TC-TE8O | FR-8 | The user passes `--prune` | The act is removed |
| TC-WYOX | FR-9 | The database has the acts "Zeds Dead" (Friday) and "Adam Beyer" (Friday) | The export writes "Adam Beyer" first |
| TC-0WA1 | FR-10 | The user runs the import with `--env prod` and does not confirm | The database is unchanged |
| TC-JOHL | FR-11 | The user exports a festival and imports the files again | The import reports no change |

### Known Issues

- `festivals.slug` and the act key constraint do not exist yet.
- A renamed artist is a new act under the act key. The dry run shows it as one add and one missing act.
- The times of 2024 and 2026 are empty in the files. 2025 has all times except two acts (Annicka, AR/CO) and the Bacardi stage, which is left out.
- The app has an older CSV helper, `src/utils/csvImport.js`. See `export.spec.md`. The two must share one parser or one must go. ??
