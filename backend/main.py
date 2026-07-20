import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

# CORS 配置（同域后可选保留）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- API 接口 ----------
@app.get("/api/health")
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
def get_all_echoes(email: str = None):
    if email:
        response = supabase.table("echoes").select("*").is_("parent_id", "null").eq("email", email).order("created_at", desc=True).execute()
    else:
        return {"echoes": []}
    return {"echoes": response.data}

@app.get("/echo/{echo_id}")
def get_echo_detail(echo_id: int, email: str = None):
    main_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not main_resp.data:
        return {"error": "回声不存在"}
    echo = main_resp.data
    if not email or echo.get("email") != email:
        return {"error": "无权查看该回声"}
    replies_resp = supabase.table("echoes").select("*").eq("parent_id", echo_id).order("created_at").execute()
    return {
        "echo": echo,
        "replies": replies_resp.data
    }

# ---------- 前端静态文件托管（放在所有 API 路由之后）----------
# 挂载 assets 目录（如果存在）
if os.path.exists("static/assets"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# 挂载根目录静态文件（index.html、CSS、JS 等）
if os.path.exists("static"):
    # 先处理前端路由的回退
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index_path = os.path.join("static", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Page not found"}

    # 挂载其他静态文件（如 favicon、manifest 等）
    app.mount("/", StaticFiles(directory="static", html=True), name="static")