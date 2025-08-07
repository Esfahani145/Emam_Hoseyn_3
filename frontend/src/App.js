import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import NotFound from './pages/NotFound';
import InvoiceSummary from './pages/InvoiceSummary';
import InvoicesPage from './pages/InvoicesPage';

function AppContent() {
  const [invoices, setInvoices] = useState([]);
  const [schools, setSchools] = useState({});
  const [budgets, setBudgets] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        const role = decodedToken.role;
        setUserRole(role);
        setIsLoggedIn(true);

        fetchSchools();
        fetchBudgets();
        fetchInvoices();
      } catch (err) {
        console.error('Token decoding failed', err);
        setUserRole(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogin = (role, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);

    setIsLoggedIn(true);
    setUserRole(role);

    fetchSchools();
    fetchBudgets();
    fetchInvoices();
  };

  const fetchSchools = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/schools/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach((s) => {
          map[s.id] = s.name;
        });
        setSchools(map);
      }
    } catch (err) {
      console.error('Error fetching schools', err);
    }
  };

  const fetchBudgets = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/budgets/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach((b) => {
          map[b.id] = b.name;
        });
        setBudgets(map);
      }
    } catch (err) {
      console.error('Error fetching budgets', err);
    }
  };

  const fetchInvoices = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/purchases/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        setInvoices(data);
      } else {
        console.error(data.detail || 'Invoice fetch failed');
      }
    } catch (err) {
      console.error('Error fetching invoices', err);
    }
  };

  const DropdownMenu = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const links = {
      manager: [
        { to: '/invoices', label: 'فاکتور‌ها' },
        { to: '/invoice-summary', label: 'خلاصه فاکتورها' },
        { to: '/manager', label: 'پنل مدیر' },
      ],
      school_admin: [
        { to: '/invoices', label: 'لیست خریدها' },
        { to: '/school', label: 'پنل مدرسه' },
      ],
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative dropdown" style={{ direction: 'rtl' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
        >
          {role === 'manager' ? 'منوی مدیر' : 'منوی مدرسه'}
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1 font-vazir">
              {links[role].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isLoggedIn &&
        (userRole === 'manager' || userRole === 'school_admin') &&
        location.pathname !== '/' && (
          <nav
            className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex gap-6 font-vazir text-gray-700 justify-end"
            style={{ direction: 'rtl' }}
          >
            <DropdownMenu role={userRole} />
          </nav>
        )}

      <main
        className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-lg shadow-sm mt-6 mb-12 font-vazir text-gray-800"
        style={{ direction: 'rtl' }}
      >
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/school" element={<SchoolDashboard />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route
            path="/invoice-summary"
            element={<InvoiceSummary invoices={invoices} schools={schools} budgets={budgets} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
