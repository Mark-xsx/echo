import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import resend

# 加载 .env 文件
load_dotenv()

app = FastAPI()

# 允许所有来源的跨域请求（开发阶段用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 从环境变量读取 Supabase 配置
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 初始化 Resend API Key
resend.api_key = os.getenv("RESEND_API_KEY")
if not resend.api_key:
    raise ValueError("请在 .env 文件中设置 RESEND_API_KEY")

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
    # 只获取顶级回声（parent_id 为 NULL）
    response = supabase.table("echoes").select("*").is_("parent_id", "null").order("created_at", desc=True).execute()
    return {"echoes": response.data}

@app.get("/echo/{echo_id}")
def get_echo_detail(echo_id: int):
    # 获取主回声
    main_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not main_resp.data:
        return {"error": "回声不存在"}
    
    # 获取所有回复（按创建时间升序）
    replies_resp = supabase.table("echoes").select("*").eq("parent_id", echo_id).order("created_at").execute()
    
    return {
        "echo": main_resp.data,
        "replies": replies_resp.data
    }

@app.post("/send-echo-email/{echo_id}")
def send_echo_email(echo_id: int):
    # 获取回声数据
    echo_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not echo_resp.data:
        return {"error": "回声不存在"}
    
    echo = echo_resp.data
    if not echo.get("email"):
        return {"error": "该回声没有留下邮箱"}
    
    # 发送邮件
    try:
        resend.Emails.send({
            "from": "Echo <onboarding@resend.dev>",
            "to": echo["email"],
            "subject": "一年前，你留了一句话",
            "html": f"""
            <p>{echo['content']}</p>
            <p style="color:#666;">这是你留在 {echo['created_at'][:10]} 的回声</p>
            <a href="http://localhost:5173/echo/{echo['id']}">查看详情</a>
            """
        })
        return {"message": "邮件已发送"}
    except Exception as e:
        return {"error": str(e)}