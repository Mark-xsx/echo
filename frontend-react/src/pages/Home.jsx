import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [content, setContent] = useState('')
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (content.trim() === '') return
    // 跳转到时间选择页面，并通过 state 传递 content
    navigate('/time-select', { state: { content } })
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Echo</h1>
      <p>今天，你想告诉未来什么？</p>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写一句话..."
      />
      <button onClick={handleSubmit}>留给未来</button>
    </div>
  )
}

export default Home