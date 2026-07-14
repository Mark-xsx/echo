import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './Success.css' // 我们马上创建这个样式文件

function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message || '已替你保管'

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 2500) // 延长到 2.5 秒，让动画更从容
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="success-container">
      <div className="checkmark">✓</div>
      <p className="success-message">{message}</p>
    </div>
  )
}

export default Success