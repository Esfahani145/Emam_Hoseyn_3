import React, { useState, useEffect } from 'react';
import PurchaseTable from '../components/PurchaseTable';
import Layout from '../components/Layout';

const BudgetSummary = () => {
    const [budget, setBudget] = useState(null);
    const [budgetType, setBudgetType] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        Promise.all([
            fetch("http://localhost:8000/api/my_budget/", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),

            fetch("http://localhost:8000/api/purchases/", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
        ])
        .then(([budgetData, purchasesData]) => {
            setBudget(budgetData.amount);           // جدیدترین سرانه
            setBudgetType(budgetData.type_display || budgetData.type);
            setPurchases(purchasesData);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <p>در حال بارگذاری...</p>;

    const totalSpent = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const remaining = budget - totalSpent;

    return (
        <div className="mb-6 p-4 bg-white rounded shadow">
            <h3 className="font-bold mb-2">💰 جدیدترین سرانه مدرسه</h3>
            <p>نوع سرانه: {budgetType}</p>
            <p>کل سرانه: {budget?.toLocaleString()} تومان</p>
            <p>مجموع هزینه شده: {totalSpent.toLocaleString()} تومان</p>
            <p className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                مانده سرانه: {remaining.toLocaleString()} تومان
            </p>
        </div>
    );
};

function SchoolDashboard() {
    return (
        <Layout title='پنل مدرسه'>
            <div className="p-4">
                <h2 className="text-xl mb-4">پنل مدرسه</h2>
                <BudgetSummary />
                <PurchaseTable />
            </div>
        </Layout>
    );
}

export default SchoolDashboard;
