import psycopg2

conn = psycopg2.connect(
    user="postgres",
    password="Cherrybuddu@1526",
    host="localhost",
    port=5433,
    dbname="brightcone_recruitment"
)
cur = conn.cursor()
cur.execute("SELECT id, name, email FROM employees;")
print("Employees in DB:", cur.fetchall())
conn.close()
