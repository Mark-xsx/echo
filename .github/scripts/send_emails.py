import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timezone
from supabase import create_client

# 从环境变量获取配置（由 GitHub Actions Secrets 注入）
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MAIL_USERNAME = os.getenv("MAIL_USERNAME")      # QQ 邮箱地址
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")      # QQ 邮箱 SMTP 授权码
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://echo-plum-rho.vercel.app")

def send_email(to_email, subject, html):
    """使用 QQ 邮箱 SMTP 发送邮件，返回 True 表示成功"""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print("缺少 MAIL_USERNAME 或 MAIL_PASSWORD 环境变量")
        return False

    msg = MIMEText(html, "html", "utf-8")
    msg["From"] = Header(f"Echo <{MAIL_USERNAME}>")
    msg["To"] = Header(to_email)
    msg["Subject"] = Header(subject, "utf-8")

    try:
        # QQ 邮箱 SMTP 服务器（STARTTLS 加密）
        server = smtplib.SMTP("smtp.qq.com", 587, timeout=10)
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

# 查询所有到期且未发送邮件的回声
now_iso = datetime.now(timezone.utc).isoformat()
response = supabase.table("echoes").select("*") \
    .lte("return_at", now_iso) \
    .eq("email_sent", False) \
    .execute()

echoes = response.data or []
sent_count = 0

for echo in echoes:
    to_email = echo.get("email")
    if not to_email:
        continue

    # 构造邮件内容
    subject = "你留给自己的回声，到了"
    html_content = f"""
    <p style="font-size:18px;">{echo['content']}</p>
    <p style="color:#666;">这是你在 {echo['created_at'][:10]} 写给未来的话。</p>
    <a href="{FRONTEND_URL}/echo/{echo['id']}">点击查看</a>
    """

    if send_email(to_email, subject, html_content):
        # 标记为已发送
        supabase.table("echoes").update({"email_sent": True}).eq("id", echo["id"]).execute()
        sent_count += 1

print(f"Sent {sent_count} emails.")