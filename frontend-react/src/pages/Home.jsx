import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/shared.css'

function Home() {
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  // 自动读取已保存的邮箱
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
    // 持久化邮箱
    localStorage.setItem('echo_email', email.trim())
    navigate('/time-select', { state: { content, email: email.trim() } })
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Echo</h1>
      <p className="page-subtitle">有些话，说给未来的自己听</p>
      
      <input
        type="text"
        className="input-echo"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="比如：一年后的我，你好吗？"
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
        留给未来
      </button>
      
      <Link className="link-text" to="/history">
        查看所有回声
      </Link>
    </div>
  )
}

export default Home