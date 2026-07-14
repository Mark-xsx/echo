import { useLocation, useNavigate } from 'react-router-dom'

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

  const handleSelect = (value) => {
    // 暂时先弹窗确认，Day 11 再连接后端
    alert(`你选择的是：${value}\n内容：${content}`)
    // 未来这里会 POST 到后端
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2>这封回声，将在什么时候回来？</h2>
      <div style={{ marginTop: '32px' }}>
        {timeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '360px',
              height: '48px',
              margin: '8px auto',
              fontSize: '16px',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              backgroundColor: 'white',
              color: '#2E2E2E',
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeSelect