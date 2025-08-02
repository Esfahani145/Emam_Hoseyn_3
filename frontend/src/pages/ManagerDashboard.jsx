import React, {useEffect, useState} from 'react';

function ManagerDashboard() {
    const [schools, setSchools] = useState([]);
    const [stores, setStores] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState([]);
    const [form, setForm] = useState({school: '', type: '', amount: ''});
    const [newStoreName, setNewStoreName] = useState('');

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        fetch('http://localhost:8000/api/schools/')
            .then(res => res.json())
            .then(setSchools);

        fetch('http://localhost:8000/api/stores/', {
            headers: {Authorization: 'Bearer ' + token}
        })
            .then(res => res.json())
            .then(data => setStores(Array.isArray(data) ? data : []));

        fetch('http://localhost:8000/api/budgets/', {
            headers: {Authorization: 'Bearer ' + token}
        })
            .then(res => res.json())
            .then(setBudgets);

        fetch('http://localhost:8000/api/purchases/summary/', {
            headers: {Authorization: 'Bearer ' + token}
        })
            .then(res => res.json())
            .then(setSummary);

        fetch('http://localhost:8000/api/purchase_summary/', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("📊 خلاصه خرید:", data);
                setSummary(data);
            });
    }, []);

    const handleSubmit = () => {
        fetch(`http://localhost:8000/api/set_budget/${form.school}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({type: form.type, amount: form.amount})
        })
            .then(res => res.json())
            .then(() => alert('✅ سرانه ثبت شد'));
    };

    const handleAddStore = () => {
        fetch('http://localhost:8000/api/stores/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({name: newStoreName})
        })
            .then(res => res.json())
            .then(store => {
                setStores([...stores, store]);
                setNewStoreName('');
                alert('✅ فروشگاه اضافه شد');
            });
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">پنل مدیر</h2>

            <div>
                <h3 className="font-bold">ثبت سرانه:</h3>
                <select onChange={e => setForm({...form, school: e.target.value})} className="block border my-2">
                    <option>انتخاب مدرسه</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select onChange={e => setForm({...form, type: e.target.value})} className="block border my-2">
                    <option>نوع سرانه</option>
                    <option>آموزشی</option>
                    <option>عمرانی</option>
                    <option>فرهنگی</option>
                </select>
                <input type="number" placeholder="مقدار سرانه"
                       onChange={e => setForm({...form, amount: e.target.value})} className="block border my-2"/>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">ثبت</button>
            </div>

            <div>
                <h3 className="font-bold">افزودن فروشگاه:</h3>
                <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)} className="border p-2"
                       placeholder="نام فروشگاه"/>
                <button onClick={handleAddStore} className="bg-blue-600 text-white px-4 py-2 rounded ml-2">افزودن
                </button>
                <ul className="list-disc pl-5 mt-2">
                    {stores.map(store => <li key={store.id}>{store.name}</li>)}
                </ul>
            </div>

            <div>
                <h3 className="font-bold">🔍 گزارش خرید مدارس:</h3>
                <table className="mt-6 w-full border text-right">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">🏫 مدرسه</th>
                        <th className="p-2">💰 کل سرانه</th>
                        <th className="p-2">🛒 هزینه کل خرید</th>
                        <th className="p-2">💵 مانده/بدهی</th>
                        <th className="p-2">📄 شرح‌حال</th>
                    </tr>
                    </thead>
                    <tbody>
                    {summary.map(s => (
                        <tr key={s.school_id}>
                            <td className="p-2">{s.school_name}</td>
                            <td className="p-2">{s.total_budget} تومان</td>
                            <td className="p-2">{s.total_spent} تومان</td>
                            <td className="p-2" style={{color: s.remaining < 0 ? 'red' : 'green'}}>
                                {s.remaining} تومان
                            </td>
                            <td className="p-2">{s.items_summary}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <input
                type="number"
                placeholder="مالیات (اختیاری)"
                onChange={e => setPurchase({...purchase, tax: e.target.value})}
            />
            <table className="mt-10 w-full border text-right">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">🏬 فروشگاه</th>
                    <th className="p-2">💳 مجموع فروش</th>
                    <th className="p-2">📈 مالیات کل</th>
                </tr>
                </thead>
                <tbody>
                {storeStats
                    .filter(s => s.total_sales > s.total_tax)
                    .map(store => (
                        <tr key={store.id}>
                            <td className="p-2">{store.name}</td>
                            <td className="p-2">{store.total_sales} تومان</td>
                            <td className="p-2">{store.total_tax} تومان</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => window.print()} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">🖨️ چاپ
                گزارش
            </button>

        </div>
    );
}

export default ManagerDashboard;
