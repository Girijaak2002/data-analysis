# 3 Workforce Risks Hiding in Your HR Data

**Prepared by:** [Your Name] | People Analytics  
**Date:** June 2026  
**Audience:** VP of Human Resources, Executive Leadership  
**Data:** 1,470 employee records across 3 departments

---

## The Problem

Replacing an employee costs 50-200% of their annual salary when you factor in recruiting, onboarding, lost productivity, and institutional knowledge. In our dataset of 1,470 employees, 237 left — a 16.1% attrition rate. At a conservative estimate of $15,000 per replacement, that's **$3.5 million walking out the door**.

But the real cost isn't evenly distributed. Attrition clusters in specific groups, driven by specific conditions. Which means targeted intervention — not broad retention programs — is the answer.

---

## What the Data Shows

**1. Overtime is a 3x attrition multiplier.**  
Employees working overtime leave at 30.5% — three times the rate of those who don't (10.4%). This isn't a correlation buried in noise; it's the single strongest predictor in the dataset. Overtime isn't commitment — it's a burnout countdown.

**2. Sales is losing 1 in 5 people.**  
The Sales department has a 20.6% attrition rate, nearly double R&D's 13.8%. Combined with the fact that Sales Reps have the highest role-level attrition (close to 40%) and the lowest average pay, there's a clear compensation-plus-workload problem concentrated in one part of the business.

**3. Employees under $3,000/month leave at twice the rate.**  
Lower-income employees (under $3K/mo) have roughly double the attrition of those earning over $10K/mo. The median income of employees who left is ~$2,000/month less than those who stayed. For the most junior roles, even small pay adjustments could shift the math on staying vs. leaving.

---

## Recommendations

### 1. Cap or flag chronic overtime
Implement a policy that triggers a manager check-in when any employee exceeds overtime thresholds for 3+ consecutive weeks. Not a ban — a circuit breaker. The goal is to surface burnout risk before it becomes a resignation letter. Estimated cost: near zero (operational, not financial). Estimated impact: high — overtime is the #1 predictor.

### 2. Conduct a targeted compensation review for Sales Reps and Lab Technicians
These two roles carry the highest attrition rates and the lowest average pay. A market-rate benchmarking exercise for these roles specifically — not a company-wide raise — would address the highest-ROI segment. Even a 5-8% adjustment for the bottom quartile of earners could reduce attrition in these roles measurably.

### 3. Build a "flight risk" early warning using existing HRIS data
The combination of overtime + low job satisfaction + early tenure (under 3 years) + no stock options identifies a group with 50%+ attrition. This isn't a predictive model — it's a filter you can build in your current HRIS system this week. Flag these employees for proactive 1:1 conversations with their managers.

---

## What I'd Do Next

**Limitations of this analysis:**
- The dataset is synthetic (IBM-published) — patterns are realistic but may not capture company-specific dynamics like manager quality or team culture
- We don't have exit interview text data, which would add qualitative color to the quantitative findings
- Attrition here is a point-in-time snapshot, not time-series data — we can't model trends over quarters

**Next steps I'd propose:**
- **Predictive modeling:** Build a logistic regression or random forest model to score individual flight risk, using the features we've identified as most predictive (overtime, income, satisfaction, tenure)
- **Manager-level analysis:** If manager IDs were available, analyzing attrition by manager would likely reveal that some managers consistently retain talent while others don't — a coaching opportunity
- **Cost-of-attrition calculator:** Build a department-level financial model that translates attrition rates into dollar costs, making the case for retention investment concrete for finance stakeholders

---

*This analysis was conducted using Python (Pandas, Matplotlib, Seaborn), SQL (SQLite), and Tableau. Full methodology and code available in the project repository.*
