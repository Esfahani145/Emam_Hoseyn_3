import React, { useState, useEffect } from "react";

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://localhost:8000/api/budgets/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت سرانه‌ها");
        return res.json();
      })
      .then((data) => {
        setBudgets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>در حال بارگذاری سرانه‌ها...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (budgets.length === 0) {
    return <p>هیچ سرانه‌ای به این مدرسه تخصیص داده نشده است.</p>;
  }

  const totalAmount = budgets.reduce((sum, b) => sum + (b.amount ?? 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount ?? 0), 0);
  const totalRemaining = totalAmount - totalSpent;
  const hasDebt = totalRemaining < 0;

  return (
    <div style={{ marginTop: 30 }}>
      <h3 className="text-xl font-bold mb-4">لیست سرانه‌های تخصیص یافته</h3>
      <table className="w-full border-collapse border border-gray-300 text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">نوع سرانه</th>
            <th className="border border-gray-300 p-2">مقدار سرانه (تومان)</th>
            <th className="border border-gray-300 p-2">مقدار مصرف شده (تومان)</th>
            <th className="border border-gray-300 p-2">باقی‌مانده (تومان)</th>
            <th className="border border-gray-300 p-2">تاریخ تخصیص</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b) => {
            const amount = b.amount ?? 0;
            const spent = b.spent_amount ?? 0;
            const remaining = amount - spent;
            return (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{b.type}</td>
                <td className="border border-gray-300 p-2">{amount.toLocaleString()}</td>
                <td className="border border-gray-300 p-2">{spent.toLocaleString()}</td>
                <td
                  className={`border border-gray-300 p-2 font-semibold ${
                    remaining < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {remaining.toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">{b.allocated_date}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-200">
            <td className="border border-gray-300 p-2">جمع کل</td>
            <td className="border border-gray-300 p-2">{totalAmount.toLocaleString()}</td>
            <td className="border border-gray-300 p-2">{totalSpent.toLocaleString()}</td>
            <td
              className={`border border-gray-300 p-2 ${
                hasDebt ? "text-red-600" : "text-green-600"
              }`}
            >
              {totalRemaining.toLocaleString()} {hasDebt ? "⚠️ بدهی" : ""}
            </td>
            <td className="border border-gray-300 p-2">-</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BudgetTable;
