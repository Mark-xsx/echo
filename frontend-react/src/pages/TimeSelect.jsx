import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/shared.css'

const timeOptions = [
  { label: '明天', value: 'tomorrow' },
  { label: '一周后', value: 'week' },
  { label: '一个月后', value: 'month' },
  { label: '一年后', value: 'year' },
  { label: '自定义', value: 'custom' },
]

function TimeSelect() {
  const location = useLocation()
  const navigate = useNavigate()
  const content = location.state?.content || ''

  const handleSelect = async (value) => {
    // ... 原有逻辑保持不变
    if (value === 'custom') {
      const days = prompt('请输入天数：')
      if (!days) return
      const returnDate = new Date()
      returnDate.setDate(returnDate.getDate() + parseInt(days))
      await submitEcho(returnDate.toISOString())
      return
    }

    const now = new Date()
    let returnDate = new Date(now)

    switch (value) {
      case 'tomorrow':
        returnDate.setDate(now.getDate() + 1)
        break
      case 'week':
        returnDate.setDate(now.getDate() + 7)
        break
      case 'month':
        returnDate.setMonth(now.getMonth() + 1)
        break
      case 'year':
        returnDate.setFullYear(now.getFullYear() + 1)
        break
      default:
        break
    }

    await submitEcho(returnDate.toISOString())
  }

  const submitEcho = async (returnDate) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/echo?content=${encodeURIComponent(content)}&return_date=${encodeURIComponent(returnDate)}`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (data.message) {
        navigate('/success', { state: { message: data.message } })
      } else {
        alert('出错了：' + (data.error || JSON.stringify(data)))
      }
    } catch (error) {
      alert('网络错误，请确认后端已启动')
    }
  }

  return (
    <div className="page-container">
      <h2 className="page-subtitle">这封回声，将在什么时候回来？</h2>
      <div style={{ marginTop: 'var(--space-md)' }}>
        {timeOptions.map((option) => (
          <button
            key={option.value}
            className="btn-secondary"
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeSelect