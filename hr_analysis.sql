-- ============================================================================
-- People Analytics: Decoding Workforce Attrition
-- SQL Analysis — Business Questions That Matter
-- ============================================================================
--
-- Data source: hr_cleaned.csv (loaded into SQLite as table 'hr')
-- To run these queries:
--   1. Open a SQLite connection
--   2. Import hr_cleaned.csv as table 'hr'
--   3. Execute queries in order
--
-- Each query answers a specific business question that a VP of HR
-- or CHRO might actually ask in a leadership meeting.
-- ============================================================================


-- ============================================================================
-- SETUP: Load the cleaned CSV into SQLite (run this in Python or SQLite CLI)
-- ============================================================================
-- In Python:
--   import sqlite3, pandas as pd
--   conn = sqlite3.connect('hr_attrition.db')
--   df = pd.read_csv('output/hr_cleaned.csv')
--   df.to_sql('hr', conn, if_exists='replace', index=False)
-- ============================================================================


-- ============================================================================
-- QUERY 1: Which department has the highest attrition rate?
-- ============================================================================
-- Business context: Department heads often resist the idea that "their" team
-- has a turnover problem. This query gives us objective numbers to have
-- that conversation.
-- ============================================================================

SELECT
    Department,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY Department
ORDER BY attrition_rate_pct DESC;

-- INSIGHT: Sales has the highest attrition rate (~21%), nearly double R&D (~14%).
-- This isn't surprising — Sales roles have higher burnout and more external
-- job market visibility. But it's the *gap* that's actionable.


-- ============================================================================
-- QUERY 2: Does working overtime significantly increase attrition?
-- ============================================================================
-- Business context: Overtime is a controllable lever. If it's strongly linked
-- to attrition, we have a concrete policy recommendation — not just
-- "improve culture" hand-waving.
-- ============================================================================

SELECT
    OverTime,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY OverTime
ORDER BY attrition_rate_pct DESC;

-- INSIGHT: Employees working overtime leave at ~30% vs ~10% for non-overtime.
-- That's a 3x multiplier. This is one of the strongest single predictors
-- in the dataset — and one of the easiest to address operationally.


-- ============================================================================
-- QUERY 3: What is the average monthly income by job role?
-- ============================================================================
-- Business context: Compensation benchmarking by role. If certain roles are
-- underpaid relative to attrition risk, that's where retention budget
-- should be directed.
-- ============================================================================

SELECT
    JobRole,
    COUNT(*) AS headcount,
    ROUND(AVG(MonthlyIncome), 0) AS avg_monthly_income,
    ROUND(MIN(MonthlyIncome), 0) AS min_income,
    ROUND(MAX(MonthlyIncome), 0) AS max_income,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY JobRole
ORDER BY avg_monthly_income DESC;

-- INSIGHT: Managers and Research Directors earn the most (>$13K/mo avg) with
-- lower attrition. Sales Reps and Lab Technicians are at the bottom of the
-- pay scale AND have the highest attrition — a compensation gap worth addressing.


-- ============================================================================
-- QUERY 4: Do employees with low job satisfaction leave more often?
-- ============================================================================
-- Business context: If satisfaction scores predict attrition, then our annual
-- engagement survey is actually a leading indicator — we just need to act on it
-- instead of filing the results away.
-- ============================================================================

SELECT
    JobSatisfaction,
    CASE JobSatisfaction
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Medium'
        WHEN 3 THEN 'High'
        WHEN 4 THEN 'Very High'
    END AS satisfaction_label,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY JobSatisfaction
ORDER BY JobSatisfaction;

-- INSIGHT: Low satisfaction (score=1) has ~22% attrition vs ~12% for Very High.
-- The relationship is clear but not as dramatic as overtime. This suggests
-- satisfaction alone doesn't drive people out — but combined with other
-- factors (overtime, pay), it tips the scale.


-- ============================================================================
-- QUERY 5: Which age group has the highest churn?
-- ============================================================================
-- Business context: Age-based attrition patterns help us design targeted
-- retention programs. Losing a 25-year-old in their first role is a
-- different problem than losing a 45-year-old mid-career professional.
-- ============================================================================

SELECT
    CASE
        WHEN Age BETWEEN 18 AND 25 THEN '18-25'
        WHEN Age BETWEEN 26 AND 35 THEN '26-35'
        WHEN Age BETWEEN 36 AND 45 THEN '36-45'
        WHEN Age BETWEEN 46 AND 55 THEN '46-55'
        ELSE '55+'
    END AS age_group,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY age_group
ORDER BY
    CASE age_group
        WHEN '18-25' THEN 1
        WHEN '26-35' THEN 2
        WHEN '36-45' THEN 3
        WHEN '46-55' THEN 4
        ELSE 5
    END;

-- INSIGHT: The 18-25 group has the highest attrition (~39%). This makes sense —
-- early-career employees are still "shopping" for the right fit. But the
-- 26-35 group (~20%) is where the real cost is: they've been trained,
-- they're productive, and replacing them is expensive.


-- ============================================================================
-- QUERY 6: Does marital status correlate with attrition?
-- ============================================================================
-- Business context: Marital status is a proxy for life stage — single
-- employees may have more geographic flexibility and fewer switching costs.
-- This isn't about discrimination, it's about understanding that
-- retention strategies may need to differ by life stage.
-- ============================================================================

SELECT
    MaritalStatus,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,
    ROUND(AVG(MonthlyIncome), 0) AS avg_income
FROM hr
GROUP BY MaritalStatus
ORDER BY attrition_rate_pct DESC;

-- INSIGHT: Single employees leave at ~25% vs ~12-14% for married/divorced.
-- This aligns with lower switching costs — single employees can relocate
-- more easily and have fewer financial commitments anchoring them to a role.


-- ============================================================================
-- QUERY 7: Are employees stagnating before they leave?
--          (Years since last promotion vs. attrition)
-- ============================================================================
-- Business context: "Career stagnation" is the #2 reason people cite in
-- exit interviews at most companies. Let's see if the data backs that up.
-- ============================================================================

SELECT
    CASE
        WHEN YearsSinceLastPromotion = 0 THEN 'Promoted this year'
        WHEN YearsSinceLastPromotion BETWEEN 1 AND 2 THEN '1-2 years ago'
        WHEN YearsSinceLastPromotion BETWEEN 3 AND 5 THEN '3-5 years ago'
        ELSE '6+ years ago'
    END AS promotion_recency,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY promotion_recency
ORDER BY
    CASE promotion_recency
        WHEN 'Promoted this year' THEN 1
        WHEN '1-2 years ago' THEN 2
        WHEN '3-5 years ago' THEN 3
        ELSE 4
    END;

-- INSIGHT: Interestingly, recently promoted employees (0 years) still show
-- notable attrition. This is counter-intuitive — but makes sense if you
-- consider that promotions sometimes come too late, after the employee
-- has already mentally checked out and started interviewing.


-- ============================================================================
-- QUERY 8: Does distance from home affect attrition?
-- ============================================================================
-- Business context: Post-COVID, commute distance matters more than ever.
-- If long-commute employees are leaving, a remote/hybrid policy
-- could be a zero-cost retention tool.
-- ============================================================================

SELECT
    CASE
        WHEN DistanceFromHome BETWEEN 1 AND 5 THEN 'Short (1-5 km)'
        WHEN DistanceFromHome BETWEEN 6 AND 15 THEN 'Medium (6-15 km)'
        ELSE 'Long (16+ km)'
    END AS commute_band,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY commute_band
ORDER BY
    CASE commute_band
        WHEN 'Short (1-5 km)' THEN 1
        WHEN 'Medium (6-15 km)' THEN 2
        ELSE 3
    END;

-- INSIGHT: The relationship is weaker than expected. Long-commute employees
-- leave slightly more, but the difference isn't dramatic. This was one of
-- my initial hypotheses that didn't pan out as strongly — which is actually
-- a useful finding to share with leadership to focus attention elsewhere.


-- ============================================================================
-- QUERY 9: Attrition by education field — any unexpected patterns?
-- ============================================================================
-- Business context: Certain educational backgrounds may signal higher
-- market demand (e.g., technical degrees have more job options).
-- ============================================================================

SELECT
    EducationField,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,
    ROUND(AVG(MonthlyIncome), 0) AS avg_income
FROM hr
GROUP BY EducationField
ORDER BY attrition_rate_pct DESC;

-- INSIGHT: Human Resources and Technical Degree holders show higher attrition
-- rates. For HR professionals specifically, this is ironic — the people
-- managing retention are themselves at higher flight risk. For technical
-- degrees, it reflects competitive external demand.


-- ============================================================================
-- QUERY 10: Do stock options actually retain people?
-- ============================================================================
-- Business context: Companies spend significant money on equity programs.
-- This query tests whether stock options are actually working as a
-- retention lever or just a cost of doing business.
-- ============================================================================

SELECT
    StockOptionLevel,
    CASE StockOptionLevel
        WHEN 0 THEN 'No stock options'
        WHEN 1 THEN 'Level 1'
        WHEN 2 THEN 'Level 2'
        WHEN 3 THEN 'Level 3'
    END AS stock_option_label,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct
FROM hr
GROUP BY StockOptionLevel
ORDER BY StockOptionLevel;

-- INSIGHT: Employees with NO stock options leave at ~24% vs ~5-8% for those
-- with any level of stock options. The effect plateaus after Level 1 —
-- meaning even a small equity grant has retention power. This is one of
-- the strongest arguments for expanding stock option eligibility downward
-- in the org chart.


-- ============================================================================
-- BONUS: High-risk employee profile
-- ============================================================================
-- Business context: Instead of looking at one factor at a time, let's
-- identify the combination that creates the highest-risk profile.
-- This is what a predictive model would do, but we can approximate
-- it with SQL to give leadership an intuitive picture.
-- ============================================================================

SELECT
    'High-Risk Profile' AS segment,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,
    ROUND(AVG(MonthlyIncome), 0) AS avg_income,
    ROUND(AVG(YearsAtCompany), 1) AS avg_tenure
FROM hr
WHERE OverTime = 'Yes'
  AND JobSatisfaction <= 2
  AND YearsAtCompany <= 3
  AND StockOptionLevel = 0

UNION ALL

SELECT
    'Everyone Else' AS segment,
    COUNT(*) AS total_employees,
    SUM(AttritionFlag) AS employees_left,
    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,
    ROUND(AVG(MonthlyIncome), 0) AS avg_income,
    ROUND(AVG(YearsAtCompany), 1) AS avg_tenure
FROM hr
WHERE NOT (OverTime = 'Yes'
  AND JobSatisfaction <= 2
  AND YearsAtCompany <= 3
  AND StockOptionLevel = 0);

-- INSIGHT: Employees who are overtime + low satisfaction + early tenure +
-- no stock options have an attrition rate north of 50%. That's a specific,
-- identifiable group that HR can proactively reach out to. This is the
-- kind of finding that turns data into action.
