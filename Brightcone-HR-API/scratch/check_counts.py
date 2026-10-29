import psycopg2

conn = psycopg2.connect(
    user="postgres",
    password="Cherrybuddu@1526",
    host="localhost",
    port=5433,
    dbname="brightcone_recruitment"
)
cur = conn.cursor()
for table in ["employees", "jobs", "candidates", "interviews", "candidate_trackers", "manpower_requirements", "offer_letters"]:
    cur.execute(f"SELECT count(*) FROM {table};")
    count = cur.fetchone()[0]
    print(f"{table}: {count} rows")
conn.close()
