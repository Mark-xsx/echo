import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/shared.css'
import API_BASE from '../config'

function History() {
  const [echoes, setEchoes] = useState([])
  const [email, setEmail] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('echo_email')
    if (savedEmail) {
      setEmail(savedEmail)
      fetch(`${API_BASE}/echoes?email=${encodeURIComponent(savedEmail)}`)
        .then(res => res.json())
        .then(data => setEchoes(data.echoes || []))
        .catch(() => setEchoes([]))
    }
  }, [])

  const handleChangeEmail = () => {
    localStorage.removeItem('echo_email')
    setEmail('')
    setEchoes([])
  }

  if (!email) {
    return (
      <div className="page-container">
        <h2 className="page-title">我的回声</h2>
        <p className="page-subtitle">你还没有设置邮箱，请先回首页写一条回声并填写邮箱。</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', lineHeight: '48px', textDecoration: 'none', marginTop: '16px' }}>
          去首页
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ textAlign: 'left' }}>
      <h2 className="page-title">我的回声</h2>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
        当前邮箱：{email}
        <button
          onClick={handleChangeEmail}
          style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          更换
        </button>
      </p>

      {echoes.length === 0 ? (
        <div>
          <p className="page-subtitle">这里还空空的。</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: 'var(--space-md)' }}>
            去写下第一封给未来的信吧。
          </p>
          <Link
            to="/"
            className="btn-primary"
            style={{ display: 'inline-block', lineHeight: '48px', textDecoration: 'none' }}
          >
            写第一封回声
          </Link>
        </div>
      ) : (
        echoes.map(echo => (
          <div key={echo.id} className="history-item">
            <Link to={`/echo/${echo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="history-content">{echo.content}</p>
            </Link>
            <p className="history-meta">
              {new Date(echo.created_at).toLocaleDateString('zh-CN')}
              {echo.return_at &&
                ` · 将于 ${new Date(echo.return_at).toLocaleDateString('zh-CN')} 回来`}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default History