import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/shared.css';
import API_BASE from '../config';

const timeOptions = [
  { label: '明天', value: 'tomorrow' },
  { label: '一周后', value: 'week' },
  { label: '一个月后', value: 'month' },
  { label: '一年后', value: 'year' },
  { label: '随机', value: 'random' },
  { label: '自定义', value: 'custom' },
];

function TimeSelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const content = location.state?.content || '';
  const email = location.state?.email || localStorage.getItem('echo_email') || '';

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDays, setCustomDays] = useState(1); // 默认1天

  const handleSelect = async (value) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      return;
    }

    if (value === 'random') {
      const maxMinutes = 365 * 24 * 60; // 一年
      const randomMinutes = Math.floor(Math.random() * (maxMinutes - 1) + 1);
      const returnDate = new Date(Date.now() + randomMinutes * 60 * 1000);
      await submitEcho(returnDate.toISOString());
      return;
    }

    const now = new Date();
    let returnDate = new Date(now);

    switch (value) {
      case 'tomorrow':
        returnDate.setDate(now.getDate() + 1);
        break;
      case 'week':
        returnDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        returnDate.setMonth(now.getMonth() + 1);
        break;
      case 'year':
        returnDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        break;
    }

    await submitEcho(returnDate.toISOString());
  };

  const submitEcho = async (returnDate) => {
    try {
      const response = await fetch(
        `${API_BASE}/echo?content=${encodeURIComponent(content)}&return_date=${encodeURIComponent(returnDate)}&email=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (data.message) {
        navigate('/success', { state: { message: data.message } });
      } else {
        alert('出错了：' + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      alert('网络错误，请确认后端已启动');
    }
  };

  const handleCustomSubmit = () => {
    const days = Number(customDays);
    if (isNaN(days) || days < 1) {
      alert('请至少设置 1 天后的时间');
      return;
    }
    const returnDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    submitEcho(returnDate.toISOString());
  };

  if (showCustomInput) {
    return (
      <div className="page-container">
        <h2 className="page-subtitle">设置你想收到回声的天数</h2>
        <p style={{ color: 'gray', fontSize: '0.9em', margin: '8px 0' }}>
          请输入至少 1 天后的天数
        </p>
        <div style={{ marginTop: 'var(--space-md)' }}>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <label>天数：</label>
            <input
              type="number"
              min="1"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              style={{ width: '80px', padding: '4px' }}
            />
          </div>
          <button className="btn-primary" onClick={handleCustomSubmit}>
            确认发送
          </button>
          <button
            className="btn-secondary"
            style={{ marginTop: '8px' }}
            onClick={() => setShowCustomInput(false)}
          >
            返回选择
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-subtitle">这封信，将在什么时候回到你身边？</h2>
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
  );
}

export default TimeSelect;