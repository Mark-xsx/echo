import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/shared.css'

function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message || '已交付给时间，它会准时回来。'

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="page-container">
      <div className="checkmark">✓</div>
      <p className="page-subtitle">{message}</p>
      {/* ↓ 新增加的这一行 ↓ */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: 'var(--space-xs)' }}>
        即将返回首页...
      </p>
      {/* ↑ 新增加的这一行 ↑ */}
    </div>
  )
}

export default Success