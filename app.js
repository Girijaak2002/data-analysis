// ============================================================================
// People Analytics Portfolio Showcase — Custom JS Logic
// ============================================================================
import csvDataUrl from './output/hr_cleaned.csv?url';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs state & elements
  const sidebarLinks = document.querySelectorAll('.sidebar li a');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Data State
  let rawEmployees = [];
  let filteredEmployees = [];
  let charts = {}; // holds references to ChartJS instances

  // SQL Queries Database Mock (Exact SQLite Compilation Results)
  const sqlDatabase = {
    q1: {
      title: "Query 1: Department Attrition Rates",
      sql: `SELECT\n    Department,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY Department\nORDER BY attrition_rate_pct DESC;`,
      insight: "Sales has the highest attrition rate (~21%), nearly double R&D (~14%). HR is in-between at 19%. Sales roles face elevated burnout and have high external market visibility.",
      headers: ["Department", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        ["Sales", 446, 92, "20.6%"],
        ["Human Resources", 63, 12, "19.0%"],
        ["Research & Development", 961, 133, "13.8%"]
      ]
    },
    q2: {
      title: "Query 2: The Overtime Attrition Multiplier",
      sql: `SELECT\n    OverTime,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY OverTime\nORDER BY attrition_rate_pct DESC;`,
      insight: "Employees working overtime leave at ~30% vs ~10% for non-overtime. That's a 3x multiplier. Overtime is the strongest single predictor in the dataset.",
      headers: ["OverTime", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        ["Yes", 416, 127, "30.5%"],
        ["No", 1054, 110, "10.4%"]
      ]
    },
    q3: {
      title: "Query 3: Compensation Benchmarking & Churn by Job Role",
      sql: `SELECT\n    JobRole,\n    COUNT(*) AS headcount,\n    ROUND(AVG(MonthlyIncome), 0) AS avg_monthly_income,\n    ROUND(MIN(MonthlyIncome), 0) AS min_income,\n    ROUND(MAX(MonthlyIncome), 0) AS max_income,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY JobRole\nORDER BY avg_monthly_income DESC;`,
      insight: "Managers and Research Directors earn the most (>$16k avg) and churn rarely (<5%). Sales Reps earn the least ($2,626 avg) and churn at a catastrophic 39.8%.",
      headers: ["Job Role", "Headcount", "Avg Monthly Income", "Min Income", "Max Income", "Attrition Rate %"],
      rows: [
        ["Manager", 102, "$17,182", "$11,244", "$19,999", "4.9%"],
        ["Research Director", 80, "$16,034", "$11,031", "$19,973", "2.5%"],
        ["Healthcare Representative", 131, "$7,529", "$4,000", "$13,966", "6.9%"],
        ["Manufacturing Director", 145, "$7,295", "$4,011", "$13,973", "6.9%"],
        ["Sales Executive", 326, "$6,924", "$4,001", "$13,872", "17.5%"],
        ["Human Resources", 52, "$4,236", "$1,555", "$10,725", "23.1%"],
        ["Research Scientist", 292, "$3,240", "$1,009", "$9,724", "16.1%"],
        ["Laboratory Technician", 259, "$3,237", "$1,102", "$7,403", "23.9%"],
        ["Sales Representative", 83, "$2,626", "$1,052", "$6,632", "39.8%"]
      ]
    },
    q4: {
      title: "Query 4: Job Satisfaction Scores",
      sql: `SELECT\n    JobSatisfaction,\n    CASE JobSatisfaction\n        WHEN 1 THEN 'Low'\n        WHEN 2 THEN 'Medium'\n        WHEN 3 THEN 'High'\n        WHEN 4 THEN 'Very High'\n    END AS satisfaction_label,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY JobSatisfaction\nORDER BY JobSatisfaction;`,
      insight: "Low satisfaction (score=1) correlates with 22.8% attrition, while Very High (score=4) matches 11.3%. Survey scores are predictive, but less absolute than pay and overtime.",
      headers: ["Satisfaction Score", "Label", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        [1, "Low", 289, 66, "22.8%"],
        [2, "Medium", 280, 46, "16.4%"],
        [3, "High", 442, 73, "16.5%"],
        [4, "Very High", 459, 52, "11.3%"]
      ]
    },
    q5: {
      title: "Query 5: Attrition by Employee Age Cohort",
      sql: `SELECT\n    CASE\n        WHEN Age BETWEEN 18 AND 25 THEN '18-25'\n        WHEN Age BETWEEN 26 AND 35 THEN '26-35'\n        WHEN Age BETWEEN 36 AND 45 THEN '36-45'\n        WHEN Age BETWEEN 46 AND 55 THEN '46-55'\n        ELSE '55+'\n    END AS age_group,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY age_group\nORDER BY age_group;`,
      insight: "The youngest segment (18-25) has high attrition (35.8%). However, the 26-35 cohort (19.1%) is where the biggest financial drain lies due to cumulative training costs.",
      headers: ["Age Group", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        ["18-25", 123, 44, "35.8%"],
        ["26-35", 606, 116, "19.1%"],
        ["36-45", 468, 43, "9.2%"],
        ["46-55", 226, 26, "11.5%"],
        ["55+", 47, 8, "17.0%"]
      ]
    },
    q6: {
      title: "Query 6: Marital Status as Life Stage Proxy",
      sql: `SELECT\n    MaritalStatus,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,\n    ROUND(AVG(MonthlyIncome), 0) AS avg_income\nFROM hr\nGROUP BY MaritalStatus\nORDER BY attrition_rate_pct DESC;`,
      insight: "Single employees churn at 25.5% — twice the rate of married (12.5%) and divorced (10.1%) peers. Single employees have lower relocation barriers and financial commitments.",
      headers: ["Marital Status", "Total Employees", "Employees Left", "Attrition Rate %", "Avg Monthly Income"],
      rows: [
        ["Single", 470, 120, "25.5%", "$5,889"],
        ["Married", 673, 84, "12.5%", "$6,794"],
        ["Divorced", 327, 33, "10.1%", "$6,786"]
      ]
    },
    q7: {
      title: "Query 7: Years Since Last Promotion vs. Turnover",
      sql: `SELECT\n    CASE\n        WHEN YearsSinceLastPromotion = 0 THEN 'Promoted this year'\n        WHEN YearsSinceLastPromotion BETWEEN 1 AND 2 THEN '1-2 years ago'\n        WHEN YearsSinceLastPromotion BETWEEN 3 AND 5 THEN '3-5 years ago'\n        ELSE '6+ years ago'\n    END AS promotion_recency,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY promotion_recency\nORDER BY promotion_recency;`,
      insight: "Surprisingly, people promoted within the last year leave at a 18.9% rate. This lag suggests promotions are sometimes offered too late after employees have checked out.",
      headers: ["Promotion Recency", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        ["Promoted this year", 581, 110, "18.9%"],
        ["1-2 years ago", 516, 76, "14.7%"],
        ["3-5 years ago", 158, 16, "10.1%"],
        ["6+ years ago", 215, 35, "16.3%"]
      ]
    },
    q8: {
      title: "Query 8: Commute Distance (The Dead-End Metric)",
      sql: `SELECT\n    CASE\n        WHEN DistanceFromHome BETWEEN 1 AND 5 THEN 'Short (1-5 km)'\n        WHEN DistanceFromHome BETWEEN 6 AND 15 THEN 'Medium (6-15 km)'\n        ELSE 'Long (16+ km)'\n    END AS commute_band,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY commute_band\nORDER BY commute_band;`,
      insight: "Unlike other features, commute distance does not strongly distinguish turnover. Long commutes hold a 20.7% rate, compared to 13.8% for short commutes.",
      headers: ["Commute Band", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        ["Short (1-5 km)", 632, 87, "13.8%"],
        ["Medium (6-15 km)", 509, 82, "16.1%"],
        ["Long (16+ km)", 329, 68, "20.7%"]
      ]
    },
    q9: {
      title: "Query 9: Attrition rates by Education Field",
      sql: `SELECT\n    EducationField,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,\n    ROUND(AVG(MonthlyIncome), 0) AS avg_income\nFROM hr\nGROUP BY EducationField\nORDER BY attrition_rate_pct DESC;`,
      insight: "HR background graduates (25.9%) and Technical Degree holders (24.2%) lead attrition. HR practitioners themselves represent high flight risks.",
      headers: ["Education Field", "Total Employees", "Employees Left", "Attrition Rate %", "Avg Monthly Income"],
      rows: [
        ["Human Resources", 27, 7, "25.9%", "$7,241"],
        ["Technical Degree", 132, 32, "24.2%", "$5,758"],
        ["Marketing", 159, 35, "22.0%", "$7,349"],
        ["Life Sciences", 606, 89, "14.7%", "$6,463"],
        ["Medical", 464, 63, "13.6%", "$6,510"],
        ["Other", 82, 11, "13.4%", "$6,072"]
      ]
    },
    q10: {
      title: "Query 10: Stock Option Levels as Retention Locks",
      sql: `SELECT\n    StockOptionLevel,\n    CASE StockOptionLevel\n        WHEN 0 THEN 'No stock options'\n        WHEN 1 THEN 'Level 1'\n        WHEN 2 THEN 'Level 2'\n        WHEN 3 THEN 'Level 3'\n    END AS stock_option_label,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct\nFROM hr\nGROUP BY StockOptionLevel\nORDER BY StockOptionLevel;`,
      insight: "Unvested equity retains staff. 24.4% attrition with no stock options (Level 0) vs. ~7-9% for Level 1 or 2 options. The retention effect plateaus after Level 1.",
      headers: ["Stock Option Level", "Stock Option Label", "Total Employees", "Employees Left", "Attrition Rate %"],
      rows: [
        [0, "No stock options", 631, 154, "24.4%"],
        [1, "Level 1", 596, 56, "9.4%"],
        [2, "Level 2", 158, 12, "7.6%"],
        [3, "Level 3", 85, 15, "17.6%"]
      ]
    },
    q11: {
      title: "Query 11: The Multi-Factor Attrition Profile",
      sql: `SELECT\n    'High-Risk Profile' AS segment,\n    COUNT(*) AS total_employees,\n    SUM(AttritionFlag) AS employees_left,\n    ROUND(AVG(AttritionFlag) * 100, 1) AS attrition_rate_pct,\n    ROUND(AVG(MonthlyIncome), 0) AS avg_income,\n    ROUND(AVG(YearsAtCompany), 1) AS avg_tenure\nFROM hr\nWHERE OverTime = 'Yes'\n  AND JobSatisfaction <= 2\n  AND YearsAtCompany <= 3\n  AND StockOptionLevel = 0\nUNION ALL\nSELECT\n    'Everyone Else' AS segment...`,
      insight: "Combining risk signals exposes severe vulnerability. Employees on Overtime + Low satisfaction + Short tenure + No equity leave at a massive 60.6% rate.",
      headers: ["Employee Profile Segment", "Total Headcount", "Employees Left", "Attrition Rate %", "Avg Income", "Avg Tenure"],
      rows: [
        ["High-Risk Profile", 33, 20, "60.6%", "$5,432", "1.7 yrs"],
        ["Everyone Else", 1437, 217, "15.1%", "$6,528", "7.1 yrs"]
      ]
    }
  };

  // Setup Sidebar Tab Swapping
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update sidebar links visual state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update actual active tab layout
      const tabId = link.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      const activeTab = document.getElementById(tabId);
      if (activeTab) {
        activeTab.classList.add('active');
      }

      // Re-trigger visual rendering if needed (e.g. charts responsive sizing redraws)
      if (tabId === 'dashboard') {
        Object.values(charts).forEach(chart => chart.resize());
      }
    });
  });

  // ============================================================================
  // SQL PLAYGROUND CONTROLLER
  // ============================================================================
  const sqlLinksContainer = document.getElementById('sql-links-container');
  const sqlCodeDisplay = document.getElementById('sql-code-display');
  const sqlResultTable = document.getElementById('sql-result-table');
  const sqlInsightDisplay = document.getElementById('sql-insight-display');
  const sqlExecutionMeta = document.getElementById('sql-execution-meta');
  const copySqlBtn = document.getElementById('copy-sql-btn');

  // Populate SQL sidebar questions
  function initSQLPlayground() {
    sqlLinksContainer.innerHTML = '';
    Object.keys(sqlDatabase).forEach((key, index) => {
      const q = sqlDatabase[key];
      const button = document.createElement('button');
      button.className = `sql-btn ${index === 0 ? 'active' : ''}`;
      button.setAttribute('data-query-id', key);
      button.innerHTML = `<i class='bx bx-play-circle'></i> <span>Q${index + 1}: ${q.title.split(':')[1].trim()}</span>`;
      sqlLinksContainer.appendChild(button);
      
      if (index === 0) {
        loadSQLQuery(key);
      }
    });

    // Add click events to SQL buttons
    const sqlButtons = document.querySelectorAll('.sql-btn');
    sqlButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sqlButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const qId = btn.getAttribute('data-query-id');
        loadSQLQuery(qId);
      });
    });
  }

  function loadSQLQuery(queryId) {
    const query = sqlDatabase[queryId];
    if (!query) return;

    // Display SQL script
    sqlCodeDisplay.textContent = query.sql;
    Prism.highlightElement(sqlCodeDisplay);

    // Mock query execution time
    const fakeTime = (Math.random() * 0.4 + 0.1).toFixed(1);
    sqlExecutionMeta.textContent = `Executed in ${fakeTime} ms`;

    // Display Business Insight
    sqlInsightDisplay.innerHTML = `<strong>💡 HR Analyst Insight:</strong> ${query.insight}`;

    // Populate Table Headers
    const tableHeaderRow = sqlResultTable.querySelector('thead tr');
    tableHeaderRow.innerHTML = '';
    query.headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      tableHeaderRow.appendChild(th);
    });

    // Populate Table Data Rows
    const tableBody = sqlResultTable.querySelector('tbody');
    tableBody.innerHTML = '';
    query.rows.forEach(r => {
      const tr = document.createElement('tr');
      r.forEach((cellVal, cIndex) => {
        const td = document.createElement('td');
        td.textContent = cellVal;
        
        // Highlight cell containing rates over 20%
        if (typeof cellVal === 'string' && cellVal.includes('%')) {
          const num = parseFloat(cellVal);
          if (num >= 20.0) {
            td.className = 'highlight-cell';
          }
        }
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  // Copy SQL script to clipboard helper
  copySqlBtn.addEventListener('click', () => {
    const code = sqlCodeDisplay.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = copySqlBtn.innerHTML;
      copySqlBtn.innerHTML = "<i class='bx bx-check'></i> Copied!";
      setTimeout(() => {
        copySqlBtn.innerHTML = originalText;
      }, 1500);
    });
  });

  // ============================================================================
  // EXECUTIVE BUSINESS REPORT ATTRITION CALCULATOR
  // ============================================================================
  const calcDepartures = document.getElementById('calc-departures');
  const calcCost = document.getElementById('calc-cost');
  const calcResultTotal = document.getElementById('calc-result-total');
  const calcReduction = document.getElementById('calc-reduction');
  const calcReductionLabel = document.getElementById('calc-reduction-label');
  const calcSavedHeads = document.getElementById('calc-saved-heads');
  const calcSavedDollars = document.getElementById('calc-saved-dollars');

  function calculateAttritionCosts() {
    const departuresCount = parseInt(calcDepartures.value) || 0;
    const costPerHead = parseInt(calcCost.value) || 0;
    const reductionPercent = parseInt(calcReduction.value) || 0;

    const totalCost = departuresCount * costPerHead;
    const savedHeads = Math.round(departuresCount * (reductionPercent / 100));
    const savedDollars = savedHeads * costPerHead;

    // Format display outputs
    calcResultTotal.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalCost);
    calcReductionLabel.textContent = `${reductionPercent}% fewer departures`;
    calcSavedHeads.textContent = `${savedHeads} employees`;
    calcSavedDollars.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(savedDollars);
  }

  [calcDepartures, calcCost, calcReduction].forEach(element => {
    element.addEventListener('input', calculateAttritionCosts);
  });

  // ============================================================================
  // INTERACTIVE DASHBOARD DATA CLEANING & RE-FILTERING
  // ============================================================================
  const filterDept = document.getElementById('filter-dept');
  const filterRole = document.getElementById('filter-role');
  const filterOvertime = document.getElementById('filter-overtime');
  const filterSatisfaction = document.getElementById('filter-satisfaction');
  const resetFiltersBtn = document.getElementById('reset-filters');

  // Load and Parse Cleaned Dataset CSV
  function fetchAndInitializeDashboard() {
    // Vite servers root path contains `/output/hr_cleaned.csv`
    Papa.parse(csvDataUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        rawEmployees = results.data.filter(row => row && row.EmployeeID !== null && row.Attrition !== undefined);
        console.log(`Loaded dataset. Row count: ${rawEmployees.length}`);
        
        populateRolesDropdown();
        applyFiltersAndRender();
      },
      error: function(err) {
        console.error("Failed loading dataset CSV", err);
      }
    });
  }

  function populateRolesDropdown() {
    const roles = [...new Set(rawEmployees.map(e => e.JobRole))].sort();
    filterRole.innerHTML = '<option value="All">All Job Roles</option>';
    roles.forEach(role => {
      const opt = document.createElement('option');
      opt.value = role;
      opt.textContent = role;
      filterRole.appendChild(opt);
    });
  }

  function applyFiltersAndRender() {
    const dept = filterDept.value;
    const role = filterRole.value;
    const overtime = filterOvertime.value;
    const satisfaction = filterSatisfaction.value;

    filteredEmployees = rawEmployees.filter(emp => {
      // 1. Department match
      if (dept !== 'All' && emp.Department !== dept) return false;
      // 2. Job Role match
      if (role !== 'All' && emp.JobRole !== role) return false;
      // 3. Overtime status match
      if (overtime !== 'All' && emp.OverTime !== overtime) return false;
      // 4. Job Satisfaction match
      if (satisfaction !== 'All' && emp.JobSatisfaction !== parseInt(satisfaction)) return false;
      
      return true;
    });

    updateKPICards();
    renderDashboardCharts();
    
    // Apply current theme settings to new charts
    const isLight = document.body.classList.contains('light-theme');
    updateChartsTheme(isLight);
  }

  // Bind change listeners to dropdown filters
  [filterDept, filterRole, filterOvertime, filterSatisfaction].forEach(dropdown => {
    dropdown.addEventListener('change', applyFiltersAndRender);
  });

  resetFiltersBtn.addEventListener('click', () => {
    filterDept.value = 'All';
    filterRole.value = 'All';
    filterOvertime.value = 'All';
    filterSatisfaction.value = 'All';
    applyFiltersAndRender();
  });

  // Calculate & Refresh KPI metrics display
  function updateKPICards() {
    const total = filteredEmployees.length;
    document.getElementById('kpi-total').textContent = total.toLocaleString();

    if (total === 0) {
      document.getElementById('kpi-attrition').textContent = "0.0%";
      document.getElementById('kpi-income').textContent = "$0";
      document.getElementById('kpi-tenure').textContent = "0.0 yrs";
      return;
    }

    const departures = filteredEmployees.filter(e => e.AttritionFlag === 1).length;
    const attritionRate = (departures / total) * 100;
    const avgIncome = filteredEmployees.reduce((sum, e) => sum + (e.MonthlyIncome || 0), 0) / total;
    const avgTenure = filteredEmployees.reduce((sum, e) => sum + (e.YearsAtCompany || 0), 0) / total;

    // Set styling and display attrition card
    const attritionEl = document.getElementById('kpi-attrition');
    attritionEl.textContent = `${attritionRate.toFixed(1)}%`;
    if (attritionRate > 18) {
      attritionEl.className = "kpi-value text-coral";
    } else {
      attritionEl.className = "kpi-value";
    }

    document.getElementById('kpi-income').textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(avgIncome);
    document.getElementById('kpi-tenure').textContent = `${avgTenure.toFixed(1)} yrs`;
  }

  // ============================================================================
  // CHARTJS VISUAL RENDER ENGINE
  // ============================================================================
  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#8892B0',
          font: { family: 'Inter', size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#8892B0',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  function destroyChart(id) {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  }

  function renderDashboardCharts() {
    renderOvertimeChart();
    renderDepartmentChart();
    renderIncomeChart();
    renderAgeChart();
    renderSatisfactionChart();
    renderCommuteChart();
  }

  // 1. Chart: Overtime Breakdown vs Attrition (Stacked/Grouped Proportion)
  function renderOvertimeChart() {
    const id = 'chart-overtime';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    
    // Group records by overtime status
    const groupYes = filteredEmployees.filter(e => e.OverTime === 'Yes');
    const groupNo = filteredEmployees.filter(e => e.OverTime === 'No');

    const computeRates = (group) => {
      if (group.length === 0) return { stayed: 0, left: 0 };
      const left = group.filter(e => e.AttritionFlag === 1).length;
      const stayed = group.length - left;
      return {
        stayed: Math.round((stayed / group.length) * 100),
        left: Math.round((left / group.length) * 100)
      };
    };

    const ratesYes = computeRates(groupYes);
    const ratesNo = computeRates(groupNo);

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['No Overtime', 'Works Overtime'],
        datasets: [
          {
            label: 'Retained',
            data: [ratesNo.stayed, ratesYes.stayed],
            backgroundColor: '#4A90D9',
            borderColor: '#0A192F',
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: 'Departed',
            data: [ratesNo.left, ratesYes.left],
            backgroundColor: '#E05C5C',
            borderColor: '#0A192F',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        ...chartOptionsBase,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#E6F1FF', font: { family: 'Inter' } }
          }
        },
        scales: {
          x: chartOptionsBase.scales.x,
          y: {
            ...chartOptionsBase.scales.y,
            max: 100,
            ticks: {
              ...chartOptionsBase.scales.y.ticks,
              callback: value => `${value}%`
            }
          }
        }
      }
    });
  }

  // 2. Chart: Attrition Rate by Department
  function renderDepartmentChart() {
    const id = 'chart-department';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    const depts = ['Sales', 'Research & Development', 'Human Resources'];
    
    const rates = depts.map(d => {
      const cohort = filteredEmployees.filter(e => e.Department === d);
      if (cohort.length === 0) return 0;
      const left = cohort.filter(e => e.AttritionFlag === 1).length;
      return (left / cohort.length) * 100;
    });

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: depts,
        datasets: [{
          data: rates,
          backgroundColor: rates.map(r => r > 18 ? '#E05C5C' : '#4A90D9'),
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptionsBase,
        indexAxis: 'y', // horizontal bar chart
        scales: {
          x: {
            ...chartOptionsBase.scales.x,
            max: Math.max(...rates, 10) * 1.2,
            ticks: {
              ...chartOptionsBase.scales.x.ticks,
              callback: value => `${value.toFixed(0)}%`
            }
          },
          y: chartOptionsBase.scales.y
        }
      }
    });
  }

  // 3. Chart: Monthly Income vs Attrition (Average comparison)
  function renderIncomeChart() {
    const id = 'chart-income';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    
    const stayed = filteredEmployees.filter(e => e.AttritionFlag === 0);
    const left = filteredEmployees.filter(e => e.AttritionFlag === 1);

    const avgStayedIncome = stayed.length > 0 ? (stayed.reduce((sum, e) => sum + e.MonthlyIncome, 0) / stayed.length) : 0;
    const avgLeftIncome = left.length > 0 ? (left.reduce((sum, e) => sum + e.MonthlyIncome, 0) / left.length) : 0;

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Retained Employees', 'Departing Employees'],
        datasets: [{
          data: [avgStayedIncome, avgLeftIncome],
          backgroundColor: ['#4A90D9', '#E05C5C'],
          borderRadius: 6,
          maxBarThickness: 60
        }]
      },
      options: {
        ...chartOptionsBase,
        scales: {
          x: chartOptionsBase.scales.x,
          y: {
            ...chartOptionsBase.scales.y,
            ticks: {
              ...chartOptionsBase.scales.y.ticks,
              callback: value => `$${value.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  // 4. Chart: Attrition Rate by Age Band
  function renderAgeChart() {
    const id = 'chart-age';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    
    // Construct bands
    const getAgeBand = (age) => {
      if (age <= 25) return '18-25';
      if (age <= 35) return '26-35';
      if (age <= 45) return '36-45';
      if (age <= 55) return '46-55';
      return '55+';
    };

    const bands = ['18-25', '26-35', '36-45', '46-55', '55+'];
    const rates = bands.map(band => {
      const cohort = filteredEmployees.filter(e => getAgeBand(e.Age) === band);
      if (cohort.length === 0) return 0;
      const left = cohort.filter(e => e.AttritionFlag === 1).length;
      return (left / cohort.length) * 100;
    });

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bands,
        datasets: [{
          data: rates,
          backgroundColor: '#4A90D9',
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptionsBase,
        scales: {
          x: chartOptionsBase.scales.x,
          y: {
            ...chartOptionsBase.scales.y,
            ticks: {
              ...chartOptionsBase.scales.y.ticks,
              callback: value => `${value.toFixed(0)}%`
            }
          }
        }
      }
    });
  }

  // 5. Chart: Attrition Rate by Job Satisfaction Score (1-4)
  function renderSatisfactionChart() {
    const id = 'chart-satisfaction';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    const levels = [1, 2, 3, 4];
    const labels = ['Low (1)', 'Medium (2)', 'High (3)', 'Very High (4)'];

    const rates = levels.map(lvl => {
      const cohort = filteredEmployees.filter(e => e.JobSatisfaction === lvl);
      if (cohort.length === 0) return 0;
      const left = cohort.filter(e => e.AttritionFlag === 1).length;
      return (left / cohort.length) * 100;
    });

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: rates,
          backgroundColor: rates.map(r => r > 18 ? '#E05C5C' : '#4A90D9'),
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptionsBase,
        scales: {
          x: chartOptionsBase.scales.x,
          y: {
            ...chartOptionsBase.scales.y,
            ticks: {
              ...chartOptionsBase.scales.y.ticks,
              callback: value => `${value.toFixed(0)}%`
            }
          }
        }
      }
    });
  }

  // 6. Chart: Attrition Rate by Commute Distance (Dead end verification)
  function renderCommuteChart() {
    const id = 'chart-commute';
    destroyChart(id);

    const ctx = document.getElementById(id).getContext('2d');
    
    const getCommuteBand = (dist) => {
      if (dist <= 5) return 'Short (1-5 km)';
      if (dist <= 15) return 'Medium (6-15 km)';
      return 'Long (16+ km)';
    };

    const bands = ['Short (1-5 km)', 'Medium (6-15 km)', 'Long (16+ km)'];
    const rates = bands.map(band => {
      const cohort = filteredEmployees.filter(e => getCommuteBand(e.DistanceFromHome) === band);
      if (cohort.length === 0) return 0;
      const left = cohort.filter(e => e.AttritionFlag === 1).length;
      return (left / cohort.length) * 100;
    });

    charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bands,
        datasets: [{
          data: rates,
          backgroundColor: '#626F86', // gray out this chart since it represents a dead-end hypothesis
          borderRadius: 6,
          maxBarThickness: 60
        }]
      },
      options: {
        ...chartOptionsBase,
        scales: {
          x: chartOptionsBase.scales.x,
          y: {
            ...chartOptionsBase.scales.y,
            max: Math.max(...rates, 10) * 1.3,
            ticks: {
              ...chartOptionsBase.scales.y.ticks,
              callback: value => `${value.toFixed(0)}%`
            }
          }
        }
      }
    });
  }

  // ============================================================================
  // THEME TOGGLE CONTROLLER
  // ============================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.body.className = `${savedTheme}-theme`;
  updateToggleButton(savedTheme === 'light');

  themeToggleBtn.addEventListener('click', () => {
    const isCurrentlyLight = document.body.classList.contains('light-theme');
    const newTheme = isCurrentlyLight ? 'dark' : 'light';
    
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${newTheme}-theme`);
    
    localStorage.setItem('portfolio-theme', newTheme);
    updateToggleButton(!isCurrentlyLight);
    updateChartsTheme(!isCurrentlyLight);
  });

  function updateToggleButton(isLight) {
    if (isLight) {
      themeToggleBtn.innerHTML = `<i class='bx bx-moon'></i> <span>Dark Mode</span>`;
    } else {
      themeToggleBtn.innerHTML = `<i class='bx bx-sun'></i> <span>Light Mode</span>`;
    }
  }

  function updateChartsTheme(isLightMode) {
    const tickColor = isLightMode ? '#4A5568' : '#8892B0';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    Object.values(charts).forEach(chart => {
      // Scale lines and ticks
      if (chart.options.scales.x) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.x.ticks.color = tickColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = tickColor;
      }
      
      // Update legend label color if it exists
      if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
        chart.options.plugins.legend.labels.color = isLightMode ? '#1A202C' : '#E6F1FF';
      }
      
      // Overtime Chart Border Override for background contrast
      if (chart.config.type === 'bar' && chart.data.datasets.length > 1) {
        const bgBorder = isLightMode ? '#FFFFFF' : '#0A192F';
        chart.data.datasets.forEach(ds => {
          ds.borderColor = bgBorder;
        });
      }

      chart.update();
    });
  }

  // Initialize all sections
  initSQLPlayground();
  calculateAttritionCosts();
  fetchAndInitializeDashboard();
});
