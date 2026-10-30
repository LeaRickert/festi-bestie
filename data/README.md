# Festival data

Master data for each festival. One folder for each festival. The folder name is
the festival slug. See [data-import.spec.md](../specs/data-import.spec.md).

```
data/<slug>/festival.yaml   festival info
data/<slug>/acts.csv        one row for each act
```

Edit `acts.csv` in Excel or any other tool. Save it as CSV UTF-8. Write times
as text in the form `HH:MM` (for example `21:30`).
