import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import '../styles/shared.css'

function Detail() {
  const { id } = useParams()
  const [echo, setEcho] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyContent, setReplyContent] = useState('')

  const fetchDetail = () => {
    fetch(`http://127.0.0.1:8000/echo/${id}`)
      .then(res => res.json())
      .then(data => {
        setEcho(data.echo)
        setReplies(data.replies || [])
      })
      .catch(() => setEcho(null))
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleReply = async () => {
    if (!replyContent.trim()) return
    const response = await fetch(
      `http://127.0.0.1:8000/echo?content=${encodeURIComponent(replyContent)}&parent_id=${id}`,
      { method: 'POST' }
    )
    const data = await response.json()
    if (data.message) {
      setReplyContent('')
      fetchDetail() // 刷新详情页
    } else {
      alert('回复失败：' + (data.error || '未知错误'))
    }
  }

  if (!echo) return <div className="page-container">加载中...</div>

  return (
    <div className="page-container" style={{ textAlign: 'left' }}>
      <Link to="/history" className="link-text" style={{ marginBottom: 'var(--space-md)' }}>← 返回历史</Link>

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
            <div key={reply.id} style={{ marginLeft: '20px', marginBottom: 'var(--space-sm)', paddingLeft: 'var(--space-sm)', borderLeft: '2px solid var(--color-border)' }}>
              <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{reply.content}</p>
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
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="告诉过去的自己..."
        />
        <button className="btn-primary" onClick={handleReply}>回复</button>
      </div>
    </div>
  )
}

export default Detail