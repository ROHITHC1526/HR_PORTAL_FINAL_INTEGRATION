import psycopg2

conn = psycopg2.connect(
    user="postgres",
    password="Cherrybuddu@1526",
    host="localhost",
    port=5433,
    dbname="brightcone_recruitment"
)
cur = conn.cursor()
cur.execute("SELECT count(*) FROM goals;")
print("Goals count:", cur.fetchone()[0])
cur.execute("SELECT count(*) FROM reviews;")
print("Reviews count:", cur.fetchone()[0])
conn.close()
