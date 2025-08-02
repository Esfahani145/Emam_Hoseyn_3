import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('school');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            if (!res.ok) throw new Error('Authentication failed');
            const data = await res.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('role', role);
            navigate(role === 'manager' ? '/manager' : '/school');
        } catch (err) {
            alert('❌ ورود ناموفق.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl">ورود</h2>
            <input placeholder="نام کاربری" value={username} onChange={e => setUsername(e.target.value)}
                   className="block mb-2 border"/>
            <input type="password" placeholder="رمز عبور" value={password} onChange={e => setPassword(e.target.value)}
                   className="block mb-2 border"/>
            <select value={role} onChange={e => setRole(e.target.value)} className="mb-4 border">
                <option value="school">مدیر مدرسه</option>
                <option value="manager">مدیر موسسه</option>
            </select>
            <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">ورود</button>
        </div>
    );
}

export default LoginPage;