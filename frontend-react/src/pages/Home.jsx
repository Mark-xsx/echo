import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/shared.css'

function Home() {
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('echo_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSubmit = () => {
    if (content.trim() === '') return
    if (!email.trim()) {
      alert('请填写邮箱，以便未来收到回声')
      return
    }
    localStorage.setItem('echo_email', email.trim())
    navigate('/time-select', { state: { content, email: email.trim() } })
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Echo</h1>
      <p className="page-subtitle">此刻的心事，来日方知。</p>

      <input
        type="text"
        className="input-echo"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="留下点什么，给那个还没遇见的人。"
      />

      <input
        type="email"
        className="input-echo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="你的邮箱（用于接收回声）"
        style={{ marginTop: '12px' }}
      />

      <button className="btn-primary" onClick={handleSubmit}>
        寄出
      </button>
    </div>
  )
}

export default Home