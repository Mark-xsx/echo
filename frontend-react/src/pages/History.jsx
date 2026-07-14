import { useEffect, useState } from 'react'

function History() {
  const [echoes, setEchoes] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/echoes')
      .then(res => res.json())
      .then(data => setEchoes(data.echoes || []))
      .catch(() => setEchoes([]))
  }, [])

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 24, fontWeight: 500 }}>所有回声</h2>
      {echoes.length === 0 && (
        <p style={{ color: '#6A6A6A' }}>还没有回声，去写第一条吧。</p>
      )}
      {echoes.map(echo => (
        <div
          key={echo.id}
          style={{
            borderBottom: '1px solid #E8E8E8',
            padding: '16px 0',
          }}
        >
          <p style={{ fontSize: 16, margin: '0 0 8px 0', color: '#2E2E2E' }}>
            {echo.content}
          </p>
          <p style={{ fontSize: 13, color: '#9A9A9A', margin: 0 }}>
            {new Date(echo.created_at).toLocaleDateString('zh-CN')}
            {echo.return_at && ` · 将于 ${new Date(echo.return_at).toLocaleDateString('zh-CN')} 回来`}
          </p>
        </div>
      ))}
    </div>
  )
}

export default History