# People Analytics: Decoding Workforce Attrition 📉

**A question I couldn't stop asking during my 5 years in HR: Why do good employees leave?**

Every quarter, we'd run exit interviews. Every quarter, the same themes emerged: "I wasn't growing," "the workload was unsustainable," "I got a better offer." And every quarter, leadership would ask for a plan to "fix retention" — as if retention is something you fix *after* people leave.

I started this project with a simple hypothesis: **the signals are already in the data.** If I could identify which employees are most likely to leave — and *why* — then maybe HR could intervene before the resignation email lands.

This project uses the IBM HR Analytics Employee Attrition Dataset (1,470 records, 35 features) to test that hypothesis. What I found was both validating and surprising. To make the findings accessible, **I built a dynamic, interactive dashboard** to visualize the attrition risks across the workforce.

---

## 💡 What I Found

| Finding | Detail |
|---------|--------|
| 🔴 **Overtime = burnout pipeline** | Employees working overtime leave at **3x** the rate of those who don't (30% vs 10%) |
| 🔴 **Sales is hemorrhaging talent** | 1 in 5 Sales employees leave — nearly double R&D's rate |
| 🔴 **Pay matters, but not how you'd think** | Employees who left earned **~$2,000/mo less** than those who stayed |
| 🟡 **Low satisfaction ≠ guaranteed exit** | Satisfaction predicts attrition, but less strongly than overtime or pay |
| 🟢 **High performers leave too** | "Outstanding" performers leave at similar rates — they have *more* options, not fewer |
| ⚪ **Commute distance? Barely matters** | Despite my initial hypothesis, distance from home is a weak predictor |

That last row is important. Real analysis has dead ends. The commute theory felt intuitive — but the data said otherwise.

---

## 🛠️ The Tech Stack

I wanted this to feel like a real tool a modern HR team would use, not just a static report. So I built it using:

* **Vite & JavaScript (ES6+)**: Fast, modern frontend tooling for the interactive dashboard.
* **Chart.js**: For rendering beautiful, responsive visualizations of the attrition data.
* **PapaParse**: To process and query the raw HR dataset directly in the browser.
* **Vanilla CSS**: For a sleek, responsive design featuring a **Dark/Light Mode toggle**.

---

## 🚀 How to Run the Dashboard Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Girijaak2002/people-analytics-attrition.git
   cd people-analytics-attrition
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm run dev
   ```

4. **View the Dashboard:** Open the localhost link provided in your terminal (usually `http://localhost:5173/`).

---

## 🎯 The Bigger Picture

This project isn't just about this dataset. It's about a shift in how HR operates:

- From **reactive** ("why did they leave?") to **proactive** ("who's at risk?")
- From **gut feel** ("Sales seems to have a problem") to **quantified** ("Sales attrition is 20.6%, cost: $X")
- From **one-size-fits-all** retention programs to **targeted interventions** for specific risk profiles

The next step would be building a predictive machine learning model to score individual flight risk — turning this descriptive analysis into a tool that HR Business Partners can use in their weekly check-ins.

---

## 👩‍💼 About Me

HR professional transitioning into Data Analytics. I built this project to demonstrate how domain expertise in HR combines with analytical tools and modern web development to solve real workforce problems.

🔗 [Check out my GitHub](https://github.com/Girijaak2002)

---

*Dataset: IBM HR Analytics Employee Attrition & Performance (synthetic, publicly available on Kaggle)*
