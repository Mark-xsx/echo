import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timezone
from supabase import create_client

# 从环境变量读取配置（由 GitHub Secrets 注入）
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://echo-plum-rho.vercel.app")

def send_email(to_email, subject, html):
    msg = MIMEText(html, "html", "utf-8")
    msg["From"] = f"Echo <{MAIL_USERNAME}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    try:
        server = smtplib.SMTP("smtp.163.com", 587, timeout=10)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_USERNAME, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Send failed for {to_email}: {e}")
        return False

# 连接 Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 查询到期且未发送的回声
now = datetime.now(timezone.utc).isoformat()
echoes = supabase.table("echoes").select("*") \
    .lte("return_at", now) \
    .eq("email_sent", False) \
    .execute().data or []

sent = 0
for echo in echoes:
    email = echo.get("email")
    if not email:
        continue
    html = f"""
    <p style="font-size:18px;">{echo['content']}</p>
    <p style="color:#666;">这是你在 {echo['created_at'][:10]} 写给未来的话。</p>
    <a href="{FRONTEND_URL}/echo/{echo['id']}">点击查看</a>
    """
    if send_email(email, "你留给自己的回声，到了", html):
        supabase.table("echoes").update({"email_sent": True}).eq("id", echo["id"]).execute()
        sent += 1

print(f"Sent {sent} emails.")