import os
from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import create_client, Client

# 加载 .env 文件（默认从当前目录或父目录找）
load_dotenv()

app = FastAPI()

# 从环境变量读取配置，不再硬编码
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 检查是否成功读取（可选，帮助调试）
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "Hello Echo"}

@app.post("/echo")
def create_echo(content: str):
    try:
        data = supabase.table("echoes").insert({"content": content}).execute()
        return {"message": "已替你保管"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/echoes")
def get_all_echoes():
    response = supabase.table("echoes").select("*").order("created_at", desc=True).execute()
    return {"echoes": response.data}