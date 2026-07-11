from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI()

# 用你自己的 Project URL 和 anon key 替换下面两个字符串
SUPABASE_URL = "https://svwpscnnnbghmlqoxtoi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d3BzY25ubmJnaG1scW94dG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NDIxOTAsImV4cCI6MjA5OTIxODE5MH0.bblSB15TH0c8jvRIlIy_XUlzmWPA45ctDVpaqgxI_88"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "Hello Echo"}

@app.post("/echo")
def create_echo(content: str):
    data = supabase.table("echoes").insert({"content": content}).execute()
    return {"message": "已替你保管"}

@app.get("/echoes")
def get_all_echoes():
    response = supabase.table("echoes").select("*").order("created_at", desc=True).execute()
    return {"echoes": response.data}