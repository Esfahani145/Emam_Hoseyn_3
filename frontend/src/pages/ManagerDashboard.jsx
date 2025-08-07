import React, {useEffect, useState} from 'react';
import Layout from '../components/Layout';

function ManagerDashboard() {
    const [schools, setSchools] = useState([]);
    const [stores, setStores] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState([]);
    const [form, setForm] = useState({school: '', type: '', amount: ''});
    const [newStoreName, setNewStoreName] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [filteredStores, setFilteredStores] = useState([]);
    const [storeStats, setStoreStats] = useState([]);
    const [editBudget, setEditBudget] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [passwordForm, setPasswordForm] = useState({current: '', newPass: '', confirm: ''});

    const token = localStorage.getItem('access_token');

    const schoolMap = schools.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {});

    const startEditing = (budget) => {
        setEditBudget({
            id: budget.id,
            school_id: budget.school_id || budget.school,
            type: budget.budget_type,
            amount: budget.amount,
        });
    };

    let [budgetTypes, setBudgetTypes] = useState([
        {id: 1, name: 'آموزش و پرورش'},
        {id: 2, name: 'فوق برنامه'},
        {id: 3, name: 'خارج از برنامه'},
    ]);

    useEffect(() => {
        fetch('http://localhost:8000/api/budget-types/', {
            headers: {Authorization: 'Bearer ' + token},
        })
            .then((res) => res.json())
            .then((data) => setBudgetTypes(data))
            .catch(console.error);
    }, [token]);

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
    }, [token]);

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

    const fetchAllData = async () => {
        await Promise.all([fetchSchools(), fetchStores(), fetchBudgets(), fetchSummary()]);
    };

    useEffect(() => {
        if (!token) {
            alert('لطفا وارد سیستم شوید');
            return;
        }
        console.log('📡 fetching all data');
        fetchAllData();
    }, [token]);

    const filterExpensiveStores = () => {
        const min = Number(minAmount);
        console.log('✅ minAmount:', minAmount);
        console.log('📊 storeStats:', storeStats);

        if (!minAmount || isNaN(min)) {
            alert('عدد معتبری وارد کنید');
            setFilteredStores([]);
            return;
        }

        const filtered = storeStats.filter((s) => {
            const total = Number(s.total_sales);
            return !isNaN(total) && total >= min;
        });

        setFilteredStores(filtered);
    };

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
            return alert('لطفا مقدار را وارد کنید');
        }
        const budgetId = editBudget.id;

        try {
            const res = await fetch(`http://localhost:8000/api/budgets/update/${budgetId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editBudget),
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

    const handlePasswordChange = (field, value) => {
        setPasswordForm((prev) => ({...prev, [field]: value}));
    };

    const handlePasswordSubmit = async () => {
        if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
            return alert('لطفا همه فیلدها را پر کنید');
        }
        if (passwordForm.newPass !== passwordForm.confirm) {
            return alert('رمز جدید با تایید آن مطابقت ندارد');
        }

        try {
            const res = await fetch('http://localhost:8000/api/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: passwordForm.current,
                    new_password: passwordForm.newPass,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('Password change error details:', errData);
                throw new Error(errData.detail || JSON.stringify(errData) || 'خطا در تغییر رمز');
            }


            alert('✅ رمز عبور با موفقیت تغییر کرد');
            setPasswordForm({current: '', newPass: '', confirm: ''});
        } catch (err) {
            alert(err.message);

        }
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/store_sales_stats/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setStoreStats(data))
            .catch((err) => {
                console.error('❌ error fetching store stats:', err);
                setStoreStats([]);
            });
    }, [token]);


    if (loading)
        return (
            <Layout title="پنل مدیر">
                <p style={{textAlign: 'center', marginTop: 20, color: '#555'}}>در حال بارگذاری...</p>
            </Layout>
        );

    return (
        <Layout title="پنل مدیر">
            <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>ثبت سرانه جدید</h3>
                <div style={formGroupStyle}>
                    <select
                        value={form.school}
                        onChange={(e) => setForm({...form, school: e.target.value})}
                        style={selectStyle}
                    >
                        <option value="">انتخاب مدرسه</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={formGroupStyle}>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({...form, type: e.target.value})}
                        style={selectStyle}
                    >
                        <option value="">نوع سرانه</option>
                        {budgetTypes.map((bt) => (
                            <option key={bt.id} value={bt.id}>
                                {bt.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={formGroupStyle}>
                    <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({...form, amount: e.target.value})}
                        placeholder="مقدار"
                        style={inputStyle}
                    />
                </div>
                <button onClick={handleSubmit} style={buttonPrimaryStyle}>
                    ثبت
                </button>
            </section>

            <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>افزودن فروشگاه جدید</h3>
                <div style={{display: 'flex', gap: 12, marginBottom: 12}}>
                    <input
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="نام فروشگاه"
                        style={{...inputStyle, flex: 1}}
                    />
                    <button onClick={handleAddStore} style={buttonPrimaryStyle}>
                        افزودن
                    </button>
                </div>
                <ul style={{paddingLeft: 20, color: '#444', maxHeight: 120, overflowY: 'auto'}}>
                    {stores.map((store) => (
                        <li key={store.id}>{store.name}</li>
                    ))}
                </ul>
            </section>

            <section style={{...sectionStyle, overflowX: 'auto'}}>
                <h3 style={sectionTitleStyle}>لیست سرانه‌ها</h3>
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
                    {budgets.map((b) => (
                        <tr key={b.id} style={{backgroundColor: editBudget?.id === b.id ? '#f0f8ff' : 'transparent'}}>
                            <td style={tdStyle}>{schoolMap[b.school] || 'نامشخص'}</td>
                            <td style={tdStyle}>
                                {budgetTypes.find((bt) => bt.id === b.budget_type)?.name || 'نامشخص'}
                            </td>
                            <td style={tdStyle}>
                                {editBudget?.id === b.id ? (
                                    <input
                                        type="number"
                                        value={editBudget.amount}
                                        onChange={(e) => handleEditChange('amount', e.target.value)}
                                        style={{width: '100px', padding: '4px', fontSize: 14}}
                                    />
                                ) : (
                                    (b.amount?.toLocaleString() || '۰') + ' تومان'
                                )}
                            </td>
                            <td style={tdStyle}>
                                {editBudget?.id === b.id ? (
                                    <>
                                        <button onClick={saveEdit} style={buttonPrimaryStyle}>
                                            ذخیره
                                        </button>
                                        {' '}
                                        <button onClick={() => setEditBudget(null)} style={buttonSecondaryStyle}>
                                            انصراف
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => startEditing(b)} style={buttonEditStyle}>
                                        ویرایش
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <div>
                <h2>📊 آمار فروش فروشگاه‌ها</h2>
                {storeStats.length === 0 ? (
                    <p>داده‌ای موجود نیست</p>
                ) : (
                    <ul>
                        {storeStats.map((store) => (
                            <li key={store.store__id}>
                                {store.store__name}: {Number(store.total_sales).toLocaleString()} تومان
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>فیلتر فروشگاه‌ها بر اساس حداقل فروش</h3>
                <div style={{display: 'flex', gap: 12, marginBottom: 12, maxWidth: 300}}>
                    <input
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="مقدار حداقل فروش (تومان)"
                        style={{...inputStyle, flex: 1}}
                    />
                    <button onClick={filterExpensiveStores} style={buttonPrimaryStyle}>
                        فیلتر
                    </button>
                </div>

                {filteredStores.length === 0 ? (
                    <p>نتیجه‌ای برای فیلتر یافت نشد.</p>
                ) : (
                    <ul style={{paddingLeft: 20, color: '#444'}}>
                        {filteredStores.map((store) => (
                            <li key={store.store__id}>
                                {store.store__name}: {Number(store.total_sales).toLocaleString()} تومان
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/*<section style={sectionStyle}>*/}
            {/*    <h3 style={sectionTitleStyle}>تغییر رمز عبور</h3>*/}
            {/*    <div style={formGroupStyle}>*/}
            {/*        <input*/}
            {/*            type="password"*/}
            {/*            placeholder="رمز عبور فعلی"*/}
            {/*            value={passwordForm.current}*/}
            {/*            onChange={(e) => handlePasswordChange('current', e.target.value)}*/}
            {/*            style={inputStyle}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*    <div style={formGroupStyle}>*/}
            {/*        <input*/}
            {/*            type="password"*/}
            {/*            placeholder="رمز عبور جدید"*/}
            {/*            value={passwordForm.newPass}*/}
            {/*            onChange={(e) => handlePasswordChange('newPass', e.target.value)}*/}
            {/*            style={inputStyle}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*    <div style={formGroupStyle}>*/}
            {/*        <input*/}
            {/*            type="password"*/}
            {/*            placeholder="تایید رمز عبور جدید"*/}
            {/*            value={passwordForm.confirm}*/}
            {/*            onChange={(e) => handlePasswordChange('confirm', e.target.value)}*/}
            {/*            style={inputStyle}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*    <button onClick={handlePasswordSubmit} style={buttonPrimaryStyle}>*/}
            {/*        تغییر رمز*/}
            {/*    </button>*/}
            {/*</section>*/}
        </Layout>
    );
}

const sectionStyle = {
    marginBottom: 30,
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
};

const sectionTitleStyle = {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
};

const formGroupStyle = {
    marginBottom: 12,
};

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid #aaa',
    fontSize: 16,
    boxSizing: 'border-box',
};

const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundColor: '#fff',
};

const buttonPrimaryStyle = {
    backgroundColor: '#004085',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 16,
};

const buttonSecondaryStyle = {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '6px 12px',
    fontSize: 14,
    cursor: 'pointer',
};

const buttonEditStyle = {
    ...buttonSecondaryStyle,
    backgroundColor: '#17a2b8',
    borderRadius: 5,
    padding: '6px 12px',
    fontSize: 14,
    cursor: 'pointer',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    color: '#222',
};

const thStyle = {
    borderBottom: '2px solid #ddd',
    padding: '10px 12px',
    textAlign: 'right',
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold',
};

const tdStyle = {
    borderBottom: '1px solid #eee',
    padding: '8px 12px',
    textAlign: 'right',
};

export default ManagerDashboard;
