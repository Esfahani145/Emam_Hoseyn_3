import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Layout from '../components/Layout';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            const access = data.access;
            const payload = jwtDecode(data.access);
            localStorage.setItem('access_token', access);
            localStorage.setItem('role', payload.role);
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

    return (
        <Layout title="ورود به سامانه">
            <input placeholder="نام کاربری" value={username} onChange={e => setUsername(e.target.value)}
                   className="block mb-2 border p-2 w-full"/>
            <input type="password" placeholder="رمز عبور" value={password} onChange={e => setPassword(e.target.value)}
                   className="block mb-2 border p-2 w-full"/>
            <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded w-full">ورود</button>
        </Layout>
    );
}

export default LoginPage;