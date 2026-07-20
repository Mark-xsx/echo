import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_BASE from '../config'
import '../styles/shared.css'

function Detail() {
  const { id } = useParams()
  const [echo, setEcho] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyContent, setReplyContent] = useState('')

  // 从 localStorage 获取当前用户邮箱
  const email = localStorage.getItem('echo_email') || ''

  const fetchDetail = () => {
    fetch(`${API_BASE}/echo/${id}?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.echo) {
          setEcho(data.echo)
          setReplies(data.replies || [])
        } else {
          setEcho({ error: data.error || '回声不存在' })
        }
      })
      .catch(() => setEcho({ error: '网络错误，请确认后端已启动' }))
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleReply = async () => {
    if (!replyContent.trim()) return
    const response = await fetch(
      `${API_BASE}/echo?content=${encodeURIComponent(replyContent)}&parent_id=${id}`,
      { method: 'POST' }
    )
    const data = await response.json()
    if (data.message) {
      setReplyContent('')
      fetchDetail()
    } else {
      alert('回复失败：' + (data.error || '未知错误'))
    }
  }

  if (!echo) {
    return <div className="page-container">加载中...</div>
  }

  if (echo.error) {
    return <div className="page-container">出错了：{echo.error}</div>
  }

  return (
    <div className="page-container" style={{ textAlign: 'left' }}>
      <Link to="/history" className="link-text" style={{ marginBottom: 'var(--space-md)' }}>
        ← 返回历史
      </Link>

      {/* 原始回声 */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--space-xs)' }}>
          {echo.content}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {new Date(echo.created_at).toLocaleDateString('zh-CN')}
          {echo.return_at && ` · 将于 ${new Date(echo.return_at).toLocaleDateString('zh-CN')} 回来`}
        </p>
      </div>

      {/* 回复列表 */}
      {replies.length > 0 && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: 'var(--space-sm)' }}>回复</h3>
          {replies.map(reply => (
            <div
              key={reply.id}
              style={{
                marginLeft: '20px',
                marginBottom: 'var(--space-sm)',
                paddingLeft: 'var(--space-sm)',
                borderLeft: '2px solid var(--color-border)',
              }}
            >
              <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {reply.content}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {new Date(reply.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 回复输入 */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <input
          type="text"
          className="input-echo"
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          placeholder="告诉过去的自己..."
        />
        <button className="btn-primary" onClick={handleReply}>
          回复
        </button>
      </div>
    </div>
  )
}

export default Detail