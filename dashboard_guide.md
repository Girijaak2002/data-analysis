# Tableau Dashboard Build Guide
## People Analytics: Decoding Workforce Attrition

---

> **Data Source:** `output/hr_cleaned.csv`  
> **Tool:** Tableau Desktop (2023.1+) or Tableau Public  
> **Estimated build time:** 25-30 minutes  
> **Pages:** 2 (Executive Overview + Deep Dive)

---

## Color Scheme

Use these exact hex codes throughout. Set them up as a custom color palette before building.

| Element           | Hex Code  | Usage                              |
|-------------------|-----------|-------------------------------------|
| Dark Navy         | `#1B2A4A` | Dashboard background, headers       |
| White             | `#FFFFFF` | Card backgrounds, text on navy      |
| Coral Accent      | `#E05C5C` | Attrition bars, KPI highlights      |
| Steel Blue        | `#4A90D9` | Retained/positive metrics           |
| Light Gray        | `#F2F3F5` | Card borders, subtle backgrounds    |
| Medium Gray       | `#8E9BAE` | Secondary text, axis labels         |

### Setting Up Custom Palette in Tableau

Add this to your `Preferences.tps` file (located in your Tableau repository folder, typically `My Tableau Repository/`):

```xml
<?xml version='1.0'?>
<workbook>
  <preferences>
    <color-palette name="People Analytics" type="regular">
      <color>#4A90D9</color>
      <color>#E05C5C</color>
      <color>#1B2A4A</color>
      <color>#F2F3F5</color>
      <color>#8E9BAE</color>
    </color-palette>
  </preferences>
</workbook>
```

Restart Tableau after editing this file.

---

## Data Connection Setup

1. Open Tableau → **Connect** → **Text File** → select `hr_cleaned.csv`
2. Tableau will auto-detect data types. Verify these manually:
   - `AttritionFlag` → change to **Dimension** (it's a measure by default but we use it both ways)
   - `JobSatisfaction`, `EnvironmentSatisfaction`, `WorkLifeBalance` → keep as integers but note they are ordinal (1-4 scale)
   - `Attrition` → String (Dimension)
3. Click **Sheet 1** to start building

---

## Calculated Fields

Create these before building any sheets. Go to **Analysis → Create Calculated Field**.

### 1. Attrition Rate
```
SUM([AttritionFlag]) / COUNT([AttritionFlag])
```
Format: **Percentage**, 1 decimal place

### 2. Total Employees
```
COUNT([AttritionFlag])
```
Format: **Number (Standard)**, 0 decimal places

### 3. Employees Who Left
```
SUM([AttritionFlag])
```

### 4. Avg Monthly Income
```
AVG([MonthlyIncome])
```
Format: **Currency**, 0 decimal places

### 5. Avg Tenure (Years)
```
AVG([YearsAtCompany])
```
Format: **Number**, 1 decimal place

### 6. Age Group
```
IF [Age] <= 25 THEN '18-25'
ELSEIF [Age] <= 35 THEN '26-35'
ELSEIF [Age] <= 45 THEN '36-45'
ELSEIF [Age] <= 55 THEN '46-55'
ELSE '55+'
END
```

### 7. Salary Band
```
IF [MonthlyIncome] <= 3000 THEN 'Under $3K'
ELSEIF [MonthlyIncome] <= 6000 THEN '$3K - $6K'
ELSEIF [MonthlyIncome] <= 10000 THEN '$6K - $10K'
ELSE 'Over $10K'
END
```

### 8. Overtime Label
```
IF [OverTime] = 'Yes' THEN 'Works Overtime'
ELSE 'No Overtime'
END
```

---

## PAGE 1 — Executive Overview

### Layout (1200 × 800 px)

```
┌─────────────────────────────────────────────────────────┐
│  PEOPLE ANALYTICS: WORKFORCE ATTRITION DASHBOARD        │
│  ─ Executive Overview ─                                 │
├────────────┬────────────┬────────────┬──────────────────┤
│            │            │            │                  │
│  TOTAL     │  ATTRITION │  AVG       │  AVG MONTHLY     │
│  EMPLOYEES │  RATE      │  TENURE    │  INCOME          │
│  1,470     │  16.1%     │  7.0 yrs   │  $6,503          │
│            │            │            │                  │
├────────────┴────────────┴────────────┴──────────────────┤
│                           │                             │
│  ATTRITION BY DEPARTMENT  │  ATTRITION BY AGE GROUP     │
│  (horizontal bar)         │  (vertical bar)             │
│                           │                             │
│  Sales ████████ 20.6%     │   ██                        │
│  HR    ██████ 19.0%       │   ██ ██                     │
│  R&D   ████ 13.8%         │   ██ ██ ██                  │
│                           │   ██ ██ ██ ██               │
│                           │  18  26  36  46  55+        │
│                           │                             │
├───────────────────────────┴─────────────────────────────┤
│ ▍ KEY INSIGHT                                           │
│ • Sales attrition (21%) is nearly double R&D (14%).     │
│   Focus retention budget on Sales first.                │
│ • 18-25 age group shows 39% attrition — an onboarding  │
│   or early-career engagement problem.                   │
│ • Avg tenure of 7 years masks a bimodal pattern:        │
│   people either leave in year 1-2 or stay 10+ years.   │
└─────────────────────────────────────────────────────────┘
```

### Building Each Component

#### KPI Cards (4 cards across the top)

For each KPI, create a **new sheet**:

**Card 1: Total Employees**
1. Drag `Total Employees` (calculated field) to **Text** on the Marks card
2. Format: 24pt bold, white font color
3. Add a label below: "Total Employees" in 10pt, `#8E9BAE`

**Card 2: Attrition Rate**
1. Drag `Attrition Rate` to **Text**
2. Format: 24pt bold, `#E05C5C` font color (coral — this is the alarming number)
3. Label below: "Attrition Rate" in 10pt, `#8E9BAE`

**Card 3: Avg Tenure**
1. Drag `Avg Tenure (Years)` to **Text**
2. Format: 24pt bold, white
3. Label: "Avg Tenure"

**Card 4: Avg Monthly Income**
1. Drag `Avg Monthly Income` to **Text**
2. Format: 24pt bold, white
3. Label: "Avg Monthly Income"

**For all cards:** Set sheet background to `#1B2A4A` (dark navy). Remove all borders, gridlines, axes.

#### Attrition by Department (Horizontal Bar)

1. New sheet → Drag `Department` to **Rows**
2. Drag `Attrition Rate` to **Columns**
3. Sort descending by `Attrition Rate`
4. Color: `#E05C5C` (coral)
5. Add `Attrition Rate` to **Label** → format as percentage
6. Remove gridlines, format axis as percentage
7. Title: "Attrition Rate by Department" (12pt, bold)
8. Set sheet background to `#1B2A4A`, axis text to `#FFFFFF`

#### Attrition by Age Group (Vertical Bar)

1. New sheet → Drag `Age Group` to **Columns**
2. Drag `Attrition Rate` to **Rows**
3. Sort by the custom sort order: 18-25, 26-35, 36-45, 46-55, 55+
4. Color: Use `Attrition Rate` on color with a sequential coral gradient
5. Add `Attrition Rate` to **Label**
6. Title: "Attrition Rate by Age Group" (12pt, bold)
7. Same dark background styling

#### Key Insight Text Box

1. In the dashboard view, drag a **Text** object into the bottom section
2. Background: `#1B2A4A` with slightly lighter left border (`#4A90D9`)
3. Text content (exactly as shown in the layout above)
4. Font: 11pt, white, with bullet points

### Assembling Page 1

1. **Dashboard** → **New Dashboard** → Set size to **1200 × 800**
2. Set dashboard background to `#1B2A4A`
3. Use **Horizontal** and **Vertical** layout containers:
   - Top row: 4 KPI card sheets in a horizontal container (equal width)
   - Middle: horizontal container with Department bar (50%) and Age Group bar (50%)
   - Bottom: Key Insight text box
4. Add a title text object at the very top: "PEOPLE ANALYTICS: WORKFORCE ATTRITION DASHBOARD" in 16pt, white, bold
5. Add padding: 8px between all elements

---

## PAGE 2 — Deep Dive

### Layout (1200 × 800 px)

```
┌─────────────────────────────────────────────────────────┐
│  PEOPLE ANALYTICS: DEEP DIVE                            │
│  ─ What's Driving Attrition? ─                          │
├──────────────┬──────────────────────────────────────────┤
│ FILTERS:     │                                          │
│ Department ▼ │  OVERTIME VS ATTRITION   (grouped bar)   │
│ Gender     ▼ │                                          │
│ Job Role   ▼ │  No OT: ████ 10%    OT: █████████ 30%   │
│              │                                          │
├──────────────┼──────────────────────────────────────────┤
│              │                                          │
│  SALARY BAND │  JOB ROLE BREAKDOWN TABLE                │
│  VS ATTRITION│                                          │
│              │  Role          │ Count │ Attrition │ Avg  │
│  Under $3K ██│  Sales Rep     │  83   │  39.8%    │ $2.6K│
│  $3K-$6K  █ │  Lab Tech      │ 259   │  23.9%    │ $3.2K│
│  $6K-$10K █ │  HR            │  52   │  23.1%    │ $5.0K│
│  $10K+    ░ │  Research Sci  │ 292   │  16.1%    │ $3.2K│
│              │  Sales Exec    │ 326   │  17.5%    │ $6.9K│
│              │  ...           │       │           │      │
├──────────────┴──────────────────────────────────────────┤
│ ▍ KEY INSIGHT                                           │
│ • Overtime employees leave at 3x the rate of non-OT.    │
│   This is the most actionable finding in the dataset.   │
│ • Employees earning under $3K/mo have 2x the attrition  │
│   of those earning $10K+ — a clear compensation gap.    │
│ • Sales Reps have the highest role-level attrition       │
│   (40%), warranting a dedicated retention initiative.    │
└─────────────────────────────────────────────────────────┘
```

### Building Each Component

#### Filters Panel (Left sidebar)

1. Create **Parameters** or use regular **Quick Filters**:
   - Drag `Department` to **Filters** shelf → Show filter → change to **Dropdown**
   - Drag `Gender` to **Filters** shelf → Show filter → Dropdown
   - Drag `JobRole` to **Filters** shelf → Show filter → Dropdown
2. Apply filters to **All Using This Data Source** so they affect all sheets on the page
3. Style: dark background, white text dropdowns

#### Overtime vs Attrition (Grouped Bar)

1. New sheet → Drag `Overtime Label` to **Columns**
2. Drag `Attrition` to **Color** on Marks
3. Drag `COUNT` or `CNTD` to **Rows** → change to percentage of total (table calc)
4. Colors: Stayed = `#4A90D9`, Left = `#E05C5C`
5. Add labels showing percentage
6. Title: "The Overtime Effect" (12pt, bold)
7. Dark background styling

#### Salary Band vs Attrition (Horizontal Bar)

1. New sheet → Drag `Salary Band` to **Rows**
2. Drag `Attrition Rate` to **Columns**
3. Sort by custom order: Under $3K, $3K-$6K, $6K-$10K, Over $10K
4. Color: coral gradient by attrition rate
5. Add labels
6. Title: "Attrition by Salary Band"

#### Job Role Breakdown Table

1. New sheet → Drag `JobRole` to **Rows**
2. Drag these to **Measure Values** (text table):
   - `Total Employees`
   - `Attrition Rate`
   - `Avg Monthly Income`
3. Sort by `Attrition Rate` descending
4. Format: Alternating row colors (`#1B2A4A` and `#223456`)
5. Header text: white, bold
6. Highlight cells where Attrition Rate > 20% with coral background

#### Key Insight Text Box

Same approach as Page 1. Content as shown in the layout.

### Assembling Page 2

1. **Dashboard** → **New Dashboard** → 1200 × 800
2. Background: `#1B2A4A`
3. Layout:
   - Left sidebar (200px wide): vertical container with 3 filter dropdowns
   - Top right: Overtime vs Attrition chart
   - Bottom left: Salary Band chart
   - Bottom right: Job Role table
   - Bottom full-width: Key Insight text box

---

## Design Rules Checklist

- [x] No 3D charts
- [x] No pie charts
- [x] Dark navy + white + coral accent scheme
- [x] Every page has a "Key Insight" text box with 2-3 bullet findings
- [x] Findings written in plain English, not technical jargon
- [x] Filters: Department, Gender, Job Role
- [x] KPI cards with clear formatting
- [x] Consistent font usage throughout

## Final Touches

1. **Dashboard Title:** Add to both pages in 16pt white bold
2. **Tooltips:** Customize tooltips on all charts to show relevant context (e.g., "Sales department: 326 employees, 56 left, 17.5% attrition rate")
3. **Navigation:** Add a page navigation button in the top-right corner of each page to switch between Overview and Deep Dive
4. **Export:** Save as `.twbx` (packaged workbook) so the data travels with the file

---

## Portfolio Presentation Tip

When sharing this dashboard in your portfolio:
1. Export each page as a high-res PNG (Dashboard → Export Image)
2. Include a 30-second screen recording showing filter interactions
3. In your README, embed the static images and link to Tableau Public if you publish it there
