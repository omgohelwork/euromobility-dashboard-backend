# Dashboard Backend – Project Overview

Short guide to how the backend works, the order of operations, file naming, data association, grouping, and indicator colors.

---

## 1. What This Backend Does

- **API** for an admin panel and user dashboard (Osservatorio).
- **Core entities:** Cities, Categories, Indicators, and **Data** (indicator values per city per year).
- **Flow:** Seed **Categories → Cities → Indicators** first; then **bulk upload** CSV/XLSX files. Data is linked to indicators by **file name** and to cities by **first column** (city name).
- **Indicator colors** (ranges) are computed after upload from the data (equal count or equal interval).

---

## 2. Order of Operations (Start Here)

When you **deploy** or run the project for the first time:

| Step  | Action                                                           | Why                                                                              |
| ----- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **1** | Set `MONGODB_URI` in env (e.g. `.env.local` or Vercel env vars). | Backend needs a MongoDB connection.                                              |
| **2** | **Run the seed** from the backend folder: `npm run seed`         | Inserts Categories, Cities, and Indicators. **Required before any data upload.** |
| **3** | Start the server: `npm run dev` or `npm start`                   | API is ready.                                                                    |
| **4** | **Load data** via Admin → bulk upload (or `POST /api/upload`)    | Upload files named `001 - Name.csv` / `.xlsx`. Data is associated automatically. |

**Rule:** Seed first → then upload. No upload without seed (no indicators/cities to attach data to).

---

## 3. Seed (Categories, Cities, Indicators)

- **Script:** `npm run seed` (runs `seed/runSeed.js`).
- **Data source:** `seed/seedData.js` (edit this file to add your categories, indicators, cities).
- **Behaviour:**
  - Connects to MongoDB (uses `MONGODB_URI`; in production seed is blocked unless you force it).
  - **Clears** existing Data, YearControl, Indicator, City, Category (in that order).
  - Inserts **Categories** (name + order).
  - Inserts **Cities** (name, latitude, longitude).
  - Inserts **Indicators** (code, name, categoryName, unit, order). `categoryName` must match a category `name` in `seedData.js`.

After seed, you have a clean set of categories, cities, and indicators.

---

## 4. Bulk Upload & File Naming

### 4.1 File name format

Indicator data files **must** follow:

```text
<code> - <Anything>.<csv|xlsx>
```

- **`<code>`:** 1–3 digits, no leading spaces. This is the **indicator code** (e.g. `1`, `01`, `001` all mean code `1`).
- **Separator:** space(s), then `-`, then space(s).
- **Extension:** `.csv` or `.xlsx` (case insensitive).

**Examples:**

- `001 - Autovetture a gas.csv` → indicator with **code 1**
- `040 - Popolazione.xlsx` → indicator with **code 40**
- `21 - Densità.xlsx` → indicator with **code 21**

If the name does not match this pattern, the upload returns an error. There must be an **Indicator** in the DB with that **code** (from seed or created via API).

### 4.2 File contents (CSV/XLSX)

- **First row:** headers.
  - First column = city identifier (treated as **city name**).
  - Other columns = **year** headers, e.g. `2014`, `2015`, `2016`.
- **Next rows:** one row per city; first cell = city name, rest = numeric values for each year. Use comma or dot for decimals; empty = no value (stored as `null`).

**Example:**

| City   | 2014 | 2015 | 2016 |
| ------ | ---- | ---- | ---- |
| Roma   | 2.5  | 2.6  | 2.7  |
| Milano | 3.1  | 3.2  |      |

- City names must match **exactly** a city in the DB (or the normalized form: e.g. "L'Aquila" vs "LAquila" is matched via normalization).
- Years are auto-detected; they are registered in **YearControl** and all enabled by default for this upload.

### 4.3 How data is associated automatically

1. **Indicator:** Taken from the **file name** → `parseCodeFromFilename()` extracts the code → backend finds the **Indicator** with that `code`. One file = one indicator; existing data for that indicator is **overwritten** for the uploaded cities/years.
2. **Cities:** Each row’s first column is the **city name** → matched against DB **City** (exact name or normalized). If a city is not found, the upload fails and reports which city names were missing.
3. **Years:** Column headers that are 4-digit numbers become years; values are stored in **Data** as `values: { "2014": number, "2015": number, ... }`.

So: **file name** → indicator; **first column** → city; **other columns** → year → value. No extra IDs in the file.

---

## 5. Data Model (Short)

- **Category:** name, order.
- **City:** name, latitude, longitude.
- **Indicator:** code (1–999), name, categoryId, unit, order, numeroCifre, **invertScale**, **rangeMode**, **ranges** (min, max, color).
- **Data:** indicatorId, cityId, **values** = `{ "2014": number|null, "2015": number|null, ... }`. One document per (indicator, city).
- **YearControl:** year, enabled. Years come from uploads; admin can disable a year.
- **ComplexIndicator:** name, **stackedIndicators** (array of indicatorId + order). Used to “group” several indicators into one composite view (e.g. stacked chart).

---

## 6. Grouping Logic

- **By category:** Indicators belong to a **Category** (`categoryId`). The frontend groups indicators by category (and order).
- **Complex indicators (stacking):** A **ComplexIndicator** is a single “virtual” indicator made of several base indicators (`stackedIndicators[].indicatorId` + order). Used to show multiple indicators together (e.g. stacked bars). No extra “grouping” of rows in the DB; grouping is by category and by complex-indicator definition.

---

## 7. Indicator Colors (Ranges)

Each indicator has:

- **rangeMode:** `equalCount` | `equalInterval` | `manual`
- **invertScale:** boolean
- **ranges:** array of `{ min, max, color }` (typically 4 buckets)

### 7.1 When ranges are set

- After a **bulk upload**, the backend **recalculates** ranges for every indicator that received data.
- You can also trigger recalculation per indicator: `POST /api/indicators/:id/recalculate`.

### 7.2 equalCount (default)

- Uses the **latest year** that has data.
- Takes all values for that indicator (all cities) for that year.
- Sorts values **descending** (highest first).
- Splits into **4 groups:** for 50 cities uses 13-13-12-12; otherwise splits as evenly as possible.
- For each group: **min** and **max** of the values in that group.
- **Colors:**
  - **invertScale = false:** group 1 (highest values) = best = green → then yellow → orange → red (worst).
  - **invertScale = true:** order is reversed (lowest = best = green, highest = worst = red).

So “higher is better” vs “lower is better” is controlled by **invertScale**.

### 7.3 equalInterval

- Same set of values (latest year, all cities for that indicator).
- **min** and **max** of the set; range `(max - min)` is split into **4 equal intervals**.
- Same color order as equalCount (green → yellow → orange → red), reversed if **invertScale** is true.

### 7.4 manual

- No automatic calculation. Ranges are edited in the admin (API supports updating `ranges` on the indicator).

### 7.5 Color palette (fixed)

- Best: green `#22c55e`
- Good: yellow `#eab308`
- Warn: orange `#f97316`
- Worst: red `#ef4444`

Order of these four is swapped when **invertScale** is true.

---

## 8. APIs (Quick Reference)

| Purpose              | Method                    | Endpoint                                                                           |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| Health               | GET                       | `/api/health`                                                                      |
| Categories           | CRUD                      | `/api/categories`                                                                  |
| Cities               | CRUD + bulk upload        | `/api/cities`, `/api/cities/upload`                                                |
| Indicators           | CRUD, invert, recalculate | `/api/indicators`, `/api/indicators/:id/invert`, `/api/indicators/:id/recalculate` |
| **Bulk data upload** | POST                      | `/api/upload` (multipart, `files[]`: CSV/XLSX with `001 - Name.csv` style)         |
| Data by indicator    | GET                       | `/api/data/:indicatorId`                                                           |
| Years                | list, enable/disable      | `/api/years`                                                                       |
| Complex indicators   | CRUD                      | `/api/complex-indicators`                                                          |

---

## 9. Deployment Checklist (e.g. Vercel)

1. Set **MONGODB_URI** in the hosting env (e.g. Vercel project env vars).
2. **Do not** run seed in production from the server; run it **once** from your machine (or a script) against the same DB:
   - `npm run seed` (with `NODE_ENV=development` or after adjusting seed if you allow it).
3. Deploy the backend.
4. Use the Admin (or API) to **upload data** with files named `001 - FileName.csv` / `.xlsx`.
5. Optionally: add more cities via Admin → Città → upload; add/edit indicators and complex indicators via API/Admin.

---

## 10. Summary

- **Start:** Configure DB → run **seed** (categories, cities, indicators) → start server → **bulk upload** data files.
- **File name:** `001 - FileName.csv` or `001 - FileName.xlsx` (code 1–999, then “ - ”, then anything).
- **Association:** File **code** → Indicator; first column → City; column headers → Years; values go into **Data** and are linked to that indicator and city.
- **Grouping:** By **category** and by **ComplexIndicator** (stacked indicators).
- **Colors:** Recalculated after upload from data (equalCount or equalInterval), with **invertScale** deciding whether high = good (default) or low = good.

For editing seed data (categories, indicators, cities), see **seed/SEED_README.md**.
