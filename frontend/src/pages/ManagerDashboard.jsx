import React, {useEffect, useState} from 'react';
import Layout from '../components/Layout';

function ManagerDashboard() {
    const [schools, setSchools] = useState([]);
    const [stores, setStores] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState([]);
    const [form, setForm] = useState({school: '', type: '', amount: ''});
    const [newStoreName, setNewStoreName] = useState('');
    const [minAmount, setMinAmount] = useState(0);
    const [filteredStores, setFilteredStores] = useState([]);
    const [storeStats, setStoreStats] = useState([]);
    const [editBudget, setEditBudget] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('access_token');
    const schoolMap = schools.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {});
    const storeMap = stores.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {});
    const [budgetId, setBudgetId] = useState(null);

    const startEditing = (budget) => {
        setEditBudget({
            id: budget.id,
            school_id: budget.school_id || budget.school,
            type: budget.budget_type,
            amount: budget.amount
        });
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/purchase-summary/', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setPurchases(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('❌ Error fetching purchases', err);
                setLoading(false);
            });
    }, []);

    let [budgetTypes, setBudgetTypes] = useState([]);
    budgetTypes = [
        {id: 1, name: 'آموزش و پرورش'},
        {id: 2, name: 'فوق برنامه'},
        {id: 3, name: 'خارج از برنامه'},
    ];

    useEffect(() => {
        fetch('http://localhost:8000/api/budget-types/', {
            headers: {Authorization: 'Bearer ' + token},
        })
            .then((res) => res.json())
            .then((data) => setBudgetTypes(data))
            .catch(console.error);
    }, []);

    const filterExpensiveStores = () => {
        const result = storeStats.filter((s) => s.total_sales > minAmount);
        setFilteredStores(result);
    };

    const fetchSchools = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/schools/', {
                headers: {Authorization: 'Bearer ' + token},
            });
            if (!res.ok) throw new Error('خطا در دریافت مدارس');
            const data = await res.json();
            setSchools(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setSchools([]);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/stores/', {
                headers: {Authorization: 'Bearer ' + token},
            });
            if (!res.ok) throw new Error('خطا در دریافت فروشگاه‌ها');
            const data = await res.json();
            setStores(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setStores([]);
        }
    };

    const fetchBudgets = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/budgets/', {
                headers: {Authorization: 'Bearer ' + token},
            });
            if (!res.ok) throw new Error('خطا در دریافت بودجه‌ها');
            const data = await res.json();
            setBudgets(data);
        } catch (err) {
            console.error(err);
            setBudgets([]);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/purchases/', {
                headers: {Authorization: 'Bearer ' + token},
            });
            if (!res.ok) throw new Error('خطا در دریافت خلاصه خرید');
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error(err);
            setSummary([]);
        }
    };

    const fetchStoreStats = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/store_stats/', {
                headers: {Authorization: 'Bearer ' + token},
            });
            if (!res.ok) throw new Error('خطا در دریافت آمار فروشگاه‌ها');
            const data = await res.json();
            setStoreStats(data);
        } catch (err) {
            console.error(err);
            setStoreStats([]);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchSchools(),
            fetchStores(),
            fetchBudgets(),
            fetchSummary(),
            fetchStoreStats(),
        ]);
    };

    useEffect(() => {
        if (!token) {
            alert('لطفا وارد سیستم شوید');
            return;
        }
        fetchAllData();
    }, [token]);

    const handleSubmit = () => {
        if (!form.school || !form.type || !form.amount) {
            return alert('لطفا همه فیلدها را پر کنید');
        }

        fetch('http://localhost:8000/api/budgets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
                school: Number(form.school),
                budget_type: Number(form.type),
                amount: Number(form.amount),
            }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(JSON.stringify(errorData));
                }
                return res.json();
            })
            .then(() => {
                alert('✅ سرانه ثبت شد');
                setForm({school: '', type: '', amount: ''});
                fetchBudgets();
            })
            .catch((err) => alert('خطا: ' + err.message));
    };

    const handleEditChange = (field, value) => {
        setEditBudget((prev) => ({...prev, [field]: value}));
    };

    const saveEdit = async () => {
        if (!editBudget.amount) {
            return alert('لطفا همه فیلدها را پر کنید');
        }
        const budgetId = editBudget.id; // اینجا حتما id را بگیرید

        try {
            const res = await fetch(`http://localhost:8000/api/budgets/update/${budgetId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editBudget)
            });

            if (!res.ok) throw new Error('خطا در ویرایش سرانه');

            await res.json();

            alert('✅ ویرایش با موفقیت انجام شد');
            setEditBudget(null);
            fetchBudgets();
            fetchSummary();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddStore = async () => {
        if (!newStoreName.trim()) {
            return alert('لطفا نام فروشگاه را وارد کنید');
        }

        try {
            const res = await fetch('http://localhost:8000/api/stores/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({name: newStoreName}),
            });
            if (!res.ok) throw new Error('خطا در افزودن فروشگاه');
            const store = await res.json();
            setStores((prev) => [...prev, store]);
            setNewStoreName('');
            alert('✅ فروشگاه اضافه شد');
        } catch (err) {
            alert(err.message);
        }
    };


    if (loading)
        return (
            <Layout title="پنل مدیر">
                <p style={{textAlign: 'center', marginTop: 20, color: '#555'}}>
                    در حال بارگذاری...
                </p>
            </Layout>
        );

    return (
        <Layout title="پنل مدیر">
            <section
                style={{
                    marginBottom: 24,
                    backgroundColor: '#f9f9f9',
                    padding: 20,
                    borderRadius: 6,
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                }}
            >
                <h3
                    style={{
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#333',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: 8,
                    }}
                >
                    ثبت سرانه جدید
                </h3>
                <div style={{marginBottom: 12}}>
                    <select
                        value={form.school}
                        onChange={(e) => setForm({...form, school: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded text-right"
                    >
                        <option value="">انتخاب مدرسه</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{marginBottom: 12}}>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({...form, type: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded text-right"
                    >
                        <option value="">نوع سرانه</option>
                        {budgetTypes.map((bt) => (
                            <option key={bt.id} value={bt.id}>
                                {bt.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{marginBottom: 12}}>
                    <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({...form, amount: e.target.value})}
                        placeholder="مقدار"
                        style={inputStyle}
                    />
                </div>
                <button onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    ثبت
                </button>
            </section>

            <section
                style={{
                    marginBottom: 24,
                    backgroundColor: '#f9f9f9',
                    padding: 20,
                    borderRadius: 6,
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                }}
            >
                <h3
                    style={{
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#333',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: 8,
                    }}
                >
                    افزودن فروشگاه جدید
                </h3>
                <div style={{display: 'flex', gap: 12, marginBottom: 12}}>
                    <input
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="نام فروشگاه"
                        style={{...inputStyle, flex: 1}}
                    />
                    <button onClick={handleAddStore}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        افزودن
                    </button>
                </div>
                <ul style={{paddingLeft: 20, color: '#444'}}>
                    {stores.map((store) => (
                        <li key={store.id}>{store.name}</li>
                    ))}
                </ul>
            </section>

            <section
                style={{
                    marginBottom: 24,
                    backgroundColor: '#f9f9f9',
                    padding: 20,
                    borderRadius: 6,
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                    overflowX: 'auto',
                }}
            >
                <h3
                    style={{
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#333',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: 8,
                    }}
                >
                    لیست سرانه‌ها
                </h3>
                <table style={tableStyle}>
                    <thead>
                    <tr>
                        <th style={thStyle}>مدرسه</th>
                        <th style={thStyle}>نوع سرانه</th>
                        <th style={thStyle}>مقدار</th>
                        <th style={thStyle}>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {budgets.map(b => (
                        <tr key={b.id}>
                            <td>{schoolMap[b.school] || 'نامشخص'}</td>
                            <td>{budgetTypes.find(bt => bt.id === b.budget_type)?.name || 'نامشخص'}</td>

                            <td>
                                {editBudget?.id === b.id ? (
                                    <input
                                        type="number"
                                        value={editBudget.amount}
                                        onChange={(e) => handleEditChange('amount', e.target.value)}
                                        style={{width: '100px', padding: '4px'}}
                                    />
                                ) : (
                                    b.amount?.toLocaleString() || '۰'
                                )}
                            </td>

                            <td>
                                {editBudget?.id === b.id ? (
                                    <>
                                        <button onClick={saveEdit} className="btn-primary">ذخیره</button>
                                        <button onClick={() => setEditBudget(null)} className="btn-secondary">انصراف
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditBudget(b)}>ویرایش</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section
                style={{
                    marginBottom: 24,
                    backgroundColor: '#f9f9f9',
                    padding: 20,
                    borderRadius: 6,
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                }}
            >
                <h3
                    style={{
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#333',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: 8,
                    }}
                >
                    فروشگاه‌هایی با مجموع فروش بیش از مبلغ وارد شده
                </h3>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 12,
                    }}
                >
                    <input
                        type="number"
                        placeholder="مبلغ (تومان)"
                        style={{...inputStyle, maxWidth: 200}}
                        onChange={(e) => setMinAmount(Number(e.target.value))}
                    />
                    <button onClick={filterExpensiveStores}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        فیلتر کن
                    </button>
                </div>
                <ul style={{paddingLeft: 20, color: '#444'}}>
                    {filteredStores.map((store) => (
                        <li key={store.store_id}>
                            {storeMap[store.store_id] || 'نامشخص'}:{' '}
                            {store.total_sales.toLocaleString()} تومان
                        </li>
                    ))}
                </ul>
            </section>

        </Layout>
    );
}

const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 14,
    color: '#333',
    boxSizing: 'border-box',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    color: '#333',
};

const thStyle = {
    borderBottom: '2px solid #bbb',
    padding: '10px 12px',
    textAlign: 'right',
    backgroundColor: '#eaeaea',
};

export default ManagerDashboard;
