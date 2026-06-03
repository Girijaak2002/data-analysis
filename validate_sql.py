import sqlite3
import pandas as pd

# Load data into SQLite
conn = sqlite3.connect(':memory:')
df = pd.read_csv('output/hr_cleaned.csv')
df.to_sql('hr', conn, if_exists='replace', index=False)
print(f"Loaded {len(df)} rows into SQLite table 'hr'")

# Read SQL file
with open('hr_analysis.sql', 'r') as f:
    sql_content = f.read()

# Split into individual queries (skip comments-only blocks)
queries = sql_content.split(';')

success = 0
errors = []

for i, q in enumerate(queries):
    # Skip empty or comment-only blocks
    lines = [l.strip() for l in q.strip().split('\n') if l.strip() and not l.strip().startswith('--')]
    if not lines:
        continue
    
    try:
        result = pd.read_sql(q + ';', conn)
        success += 1
        print(f"\nQuery {success}: OK ({len(result)} rows)")
        print(result.to_string(index=False))
    except Exception as e:
        errors.append(f"Query block {i}: {str(e)[:120]}")

print(f"\n{'='*50}")
print(f"Total queries executed: {success}")
if errors:
    print(f"Errors: {len(errors)}")
    for e in errors:
        print(f"  ERROR: {e}")
else:
    print("All queries passed!")

conn.close()
