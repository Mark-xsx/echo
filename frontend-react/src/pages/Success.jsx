import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message || '已替你保管'

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', marginTop: '80px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
      <p style={{ fontSize: '18px', color: '#6A6A6A' }}>{message}</p>
    </div>
  )
}

export default Success