import { useState } from 'react'

function App() {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim() === '') return
    alert('你写的是：' + content)
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

export default App