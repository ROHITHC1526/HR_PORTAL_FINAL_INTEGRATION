import psycopg2

try:
    conn = psycopg2.connect(
        user="postgres",
        password="Cherrybuddu@1526",
        host="localhost",
        port=5433,
        dbname="brightcone_recruitment"
    )
    cur = conn.cursor()
    cur.execute("SELECT id, name, email FROM users;")
    rows = cur.fetchall()
    print("Users in DB:", rows)
    conn.close()
except Exception as e:
    print("Error:", e)
