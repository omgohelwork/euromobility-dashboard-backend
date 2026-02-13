# Seed: what to provide

Before running **bulk upload** of indicator CSV/XLSX files, the database must have:

1. **Categories**
2. **Indicators** (with codes that match your file names: `001 - Nome.csv` → code `1`)
3. **Cities** (names must match the first column of your data files)

Edit `seed/seedData.js` with your data, then run from the **backend** folder:

```bash
npm run seed
```

---

## 1. Categories

Provide a list of **category names** (and optional display order).

**Format in seedData.js:**  
`{ name: 'Nome categoria', order: 1 }`

Example:
- Mobilità
- Ambiente
- Demografia

---

## 2. Indicators

Provide one entry per indicator. The **code** must match the number in your file name (e.g. `001 - Autovetture a gas.xlsx` → code `1`).  
**categoryName** must match exactly one of the category names you added above.

**Format in seedData.js:**  
`{ code: 1, name: 'Nome indicatore', categoryName: 'Mobilità', unit: 'Abitanti', order: 1 }`

You need:
- **code** – number (1, 2, 3, …) from the file name
- **name** – label for the indicator
- **categoryName** – must match a category `name`
- **unit** – e.g. "Abitanti", "µg/m³", "n."
- **order** – optional display order

---

## 3. Cities

Provide **name**, **latitude**, **longitude** for every city that appears in the first column of your indicator CSV/XLSX files. Names must match exactly (same spelling and accents).

**Format in seedData.js:**  
`{ name: 'Roma', latitude: 41.9028, longitude: 12.4964 }`

If you prefer not to list them here, you can:
1. Run the seed without cities (or with an empty `cities` array).
2. Then go to **Admin → Città** and upload a CSV/XLSX with columns `name`, `latitude`, `longitude`.

---

## Order of operations

1. Edit `backend/seed/seedData.js` with your categories, indicators, and cities.
2. From `backend` folder: `npm run seed`
3. Start the backend and use **Admin → Carica dati** to upload your indicator files (e.g. `001 - Nome.xlsx`).
