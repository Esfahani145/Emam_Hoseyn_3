import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Authentication failed');
      const data = await res.json();
      const access = data.access;
      const payload = jwtDecode(access);

      localStorage.setItem('access_token', access);
      localStorage.setItem('user_role', payload.role);

      if (payload.role === 'school_admin') {
        localStorage.setItem('school_id', payload.school_id);
        localStorage.setItem('school_name', payload.school_name);
      }

      if (payload.role === 'manager') {
        navigate('/manager');
      } else if (payload.role === 'school_admin') {
        navigate('/school');
      } else {
        alert('نقش کاربر نامعتبر است.');
      }
    } catch (err) {
      alert('❌ ورود ناموفق.');
    }
  };

  const styles = {
    container: {
      height: '100vh',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    box: {
      backgroundColor: '#ffffff',
      padding: '40px 50px',
      borderRadius: 12,
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      width: '360px',
      textAlign: 'center',
    },
    title: {
      marginBottom: '30px',
      color: '#1a237e',
      fontSize: '28px',
      fontWeight: '700',
      letterSpacing: '1px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      fontSize: '14px',
      color: '#333',
      textAlign: 'right',
      direction: 'rtl',
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      marginBottom: '20px',
      fontSize: '15px',
      borderRadius: '6px',
      border: '1.5px solid #bbb',
      outline: 'none',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box',
      textAlign: 'right',
      direction: 'rtl',
    },
    inputFocus: {
      borderColor: '#3949ab',
      boxShadow: '0 0 6px rgba(57,73,171,0.5)',
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: '16px',
      fontWeight: '700',
      color: '#fff',
      backgroundColor: '#3949ab',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonHover: {
      backgroundColor: '#283593',
    },
  };

  // برای مدیریت حالت فوکوس input
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>ورود به سامانه</h2>

        <label style={styles.label} htmlFor="username">
          نام کاربری
        </label>
        <input
          id="username"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setUsernameFocused(true)}
          onBlur={() => setUsernameFocused(false)}
          style={{
            ...styles.input,
            ...(usernameFocused ? styles.inputFocus : {}),
          }}
        />

        <label style={styles.label} htmlFor="password">
          رمز عبور
        </label>
        <input
          id="password"
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          style={{
            ...styles.input,
            ...(passwordFocused ? styles.inputFocus : {}),
          }}
        />

        <button
          onClick={handleLogin}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          style={{
            ...styles.button,
            ...(buttonHovered ? styles.buttonHover : {}),
          }}
        >
          ورود
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
