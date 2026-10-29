import psycopg2

conn = psycopg2.connect(
    user="postgres",
    password="Cherrybuddu@1526",
    host="localhost",
    port=5433,
    dbname="brightcone_recruitment"
)
cur = conn.cursor()
cur.execute("""
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND data_type LIKE '%time%'
    ORDER BY table_name, column_name;
""")
rows = cur.fetchall()
print("Timestamp columns in DB:")
for r in rows:
    print(r)
conn.close()
