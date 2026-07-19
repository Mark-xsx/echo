import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# 加载 .env 文件（本地开发用，生产环境 Render 会直接注入环境变量）
load_dotenv()

app = FastAPI()

# CORS 配置
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

# ---------- 163 SMTP 邮件发送函数 ----------
def send_email_via_163(to_email: str, subject: str, html_content: str) -> bool:
    """使用 163 邮箱 SMTP 发送邮件，返回 True 表示成功"""
    sender_email = os.getenv("MAIL_USERNAME")      # 你的 163 邮箱地址
    sender_password = os.getenv("MAIL_PASSWORD")   # 163 授权码
    smtp_server = "smtp.163.com"
    smtp_port = 587  # STARTTLS 端口

    if not sender_email or not sender_password:
        print("缺少 MAIL_USERNAME 或 MAIL_PASSWORD 环境变量")
        return False

    msg = MIMEText(html_content, "html", "utf-8")
    msg["From"] = Header(f"Echo <{sender_email}>")
    msg["To"] = Header(to_email)
    msg["Subject"] = Header(subject, "utf-8")

    try:
        # 建立普通 SMTP 连接，然后升级为 TLS 加密
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"163 mail send error: {e}")
        return False


# ---------- API 接口 ----------

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
    # 只返回顶级回声（非回复）
    response = supabase.table("echoes").select("*").is_("parent_id", "null").order("created_at", desc=True).execute()
    return {"echoes": response.data}


@app.get("/echo/{echo_id}")
def get_echo_detail(echo_id: int):
    main_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not main_resp.data:
        return {"error": "回声不存在"}
    replies_resp = supabase.table("echoes").select("*").eq("parent_id", echo_id).order("created_at").execute()
    return {
        "echo": main_resp.data,
        "replies": replies_resp.data
    }


@app.post("/send-echo-email/{echo_id}")
def send_echo_email(echo_id: int):
    """手动发送指定回声的邮件（测试用）"""
    echo_resp = supabase.table("echoes").select("*").eq("id", echo_id).single().execute()
    if not echo_resp.data:
        return {"error": "回声不存在"}
    echo = echo_resp.data
    if not echo.get("email"):
        return {"error": "该回声没有留下邮箱"}
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    success = send_email_via_163(
        to_email=echo["email"],
        subject="你留给自己的回声，到了",
        html_content=f"""
        <p style="font-size:18px;">{echo['content']}</p>
        <p style="color:#666;">这是你在 {echo['created_at'][:10]} 写给未来的话。</p>
        <a href="{frontend_url}/echo/{echo['id']}">点击查看</a>
        """
    )
    if success:
        supabase.table("echoes").update({"email_sent": True}).eq("id", echo_id).execute()
        return {"message": "邮件已发送"}
    else:
        return {"error": "邮件发送失败，请稍后重试"}


@app.post("/cron/send-emails")
def cron_send_emails(token: str = None):
    """定时任务：检查到期回声并发送邮件（由 GitHub Actions 调用）"""
    expected_token = os.getenv("CRON_SECRET", "my-secret-token")
    if token != expected_token:
        return {"error": "Unauthorized"}
    
    try:
        now_iso = datetime.now(timezone.utc).isoformat()
        response = supabase.table("echoes").select("*") \
            .lte("return_at", now_iso) \
            .eq("email_sent", False) \
            .execute()
        echoes = response.data or []

        sent_count = 0
        for echo in echoes:
            if not echo.get("email"):
                continue
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            success = send_email_via_163(
                to_email=echo["email"],
                subject="你留给自己的回声，到了",
                html_content=f"""
                <p style="font-size:18px;">{echo['content']}</p>
                <p style="color:#666;">这是你在 {echo['created_at'][:10]} 写给未来的话。</p>
                <a href="{frontend_url}/echo/{echo['id']}">点击查看</a>
                """
            )
            if success:
                supabase.table("echoes").update({"email_sent": True}).eq("id", echo["id"]).execute()
                sent_count += 1

        return {"message": f"已处理 {len(echoes)} 条回声，成功发送 {sent_count} 封邮件"}
    except Exception as e:
        return {"error": str(e)}