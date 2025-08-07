import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, NavLink} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import NotFound from './pages/NotFound';
import Invoices from './pages/Invoices';
import InvoiceSummary from './pages/InvoiceSummary';
import InvoicesPage from './pages/InvoicesPage';

function App() {
    const [invoices, setInvoices] = useState([]);
    const [schools, setSchools] = useState({});
    const [budgets, setBudgets] = useState({});
    const token = localStorage.getItem('access_token');

    const fetchSchools = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/schools/', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.status === 401) {
                console.error("توکن معتبر نیست یا منقضی شده:", data.detail);
                return;
            }

            if (!Array.isArray(data)) {
                console.error("فرمت داده غیرمنتظره:", data);
                return;
            }

            const schoolMap = {};
            data.forEach((school) => {
                schoolMap[school.id] = school.name;
            });
            setSchools(schoolMap);

        } catch (e) {
            console.error('Error fetching schools', e);
        }
    };

    const fetchBudgets = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/budgets/', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error("فرمت داده بودجه غیرمنتظره:", data);
                return;
            }

            const budgetMap = {};
            data.forEach((budget) => {
                budgetMap[budget.id] = budget.name; // یا هر فیلدی که اسم نوع سرانه هست
            });
            setBudgets(budgetMap);

        } catch (err) {
            console.error("مشکل در گرفتن نوع سرانه‌ها", err);
        }
    };


    const fetchInvoices = async (startDate = '', endDate = '') => {
        try {
            let url = 'http://localhost:8000/api/purchases/';
            if (startDate && endDate) {
                url += `?start_date=${startDate}&end_date=${endDate}`;
            }
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.status === 200) {
                setInvoices(data);
            } else {
                console.error(data.detail || 'خطایی رخ داده است');
            }
        } catch (err) {
            console.error('مشکل در ارتباط با سرور');
        }
    };

    useEffect(() => {
        fetchSchools();
        fetchInvoices();
        fetchBudgets();
    }, []);

    return (
        <Router>
            <nav className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex gap-6 font-vazir text-gray-700"
                 style={{direction: 'rtl'}}>
                <NavLink
                    to="/invoices"
                    className={({isActive}) =>
                        `px-3 py-2 rounded-md transition-colors duration-200 ${
                            isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'
                        }`
                    }
                >
                    لیست خریدها
                </NavLink>
                <NavLink
                    to="/invoice-summary"
                    className={({isActive}) =>
                        `px-3 py-2 rounded-md transition-colors duration-200 ${
                            isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'
                        }`
                    }
                >
                    خلاصه فاکتورها
                </NavLink>
            </nav>

            <main
                className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-lg shadow-sm mt-6 mb-12 font-vazir text-gray-800"
                style={{direction: 'rtl'}}>
                <Routes>
                    <Route path="/" element={<LoginPage/>}/>
                    <Route path="/manager" element={<ManagerDashboard/>}/>
                    <Route path="/school" element={<SchoolDashboard/>}/>
                    <Route path="/invoices" element={<InvoicesPage/>}/>
                    <Route path="/invoice-summary" element={
                        <InvoiceSummary
                            invoices={invoices}
                            schools={schools}
                            budgets={budgets}
                        />
                    }
                    />
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </main>
        </Router>
    );
}

export default App;
