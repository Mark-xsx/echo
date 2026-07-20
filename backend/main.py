import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "Hello Echo"}

@app.post("/echo")
def create_echo(content: str, return_date: str = None, parent_id: int = None, email: str = None):
    try:
        data = {"content": content}
        if return_date:
            data["return_at"] = return_date
        if parent_id is not None:
            data["parent_id"] = parent_id
        if email:
            data["email"] = email
        supabase.table("echoes").insert(data).execute()
        return {"message": "已替你保管"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/echoes")
def get_all_echoes():
    response = supabase.table("echoes").select("*").is_("parent_id", "null").order("created_at", desc=True).execute()
    return {"echoes": response.data}

@app.get("/echo/{echo_id}")
def get_echo_detail(echo_id: int, email: str = None):
    main_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not main_resp.data:
        return {"error": "回声不存在"}
    echo = main_resp.data
    # 隐私保护：必须提供匹配的邮箱，否则拒绝访问
    if not email or echo.get("email") != email:
        return {"error": "无权查看该回声"}
    replies_resp = supabase.table("echoes").select("*").eq("parent_id", echo_id).order("created_at").execute()
    return {
        "echo": echo,
        "replies": replies_resp.data
    }