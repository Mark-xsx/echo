import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/shared.css'
import API_BASE from '../config'

function History() {
  const [echoes, setEchoes] = useState([])

  useEffect(() => {
  fetch(`${API_BASE}/echoes`)
     .then(res => res.json())
     .then(data => setEchoes(data.echoes || []))
     .catch(() => setEchoes([]))
}, [])

  return (
    <div className="page-container">
      <h2 className="page-title">所有回声</h2>

      {echoes.length === 0 && (
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
      )}

      {echoes.map(echo => (
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
      ))}
    </div>
  )
}

export default History