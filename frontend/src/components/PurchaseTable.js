import React, { useState } from "react";

// ✅ کامپوننت ساده Card
const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

// ✅ کامپوننت ساده Button
const Button = ({ children, onClick, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded text-white ${
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
    } ${className}`}
  >
    {children}
  </button>
);

const PurchaseTable = ({ budgetAmount = 1000000, storeList = [] }) => {
  const [rows, setRows] = useState([
    { description: "", quantity: 0, price: 0, store: "", total: 0 },
  ]);

  const addRow = () => {
    setRows([...rows, { description: "", quantity: 0, price: 0, store: "", total: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    const updatedRow = { ...newRows[index], [field]: value };
    updatedRow.total = updatedRow.quantity * updatedRow.price;
    newRows[index] = updatedRow;
    setRows(newRows);
  };

  const deleteRow = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const totalSum = rows.reduce((sum, r) => sum + r.total, 0);
  const overBudget = totalSum > budgetAmount;

  const handleSubmit = async () => {
    if (overBudget) {
      alert("⚠️ مجموع هزینه‌ها از مقدار سرانه بیشتر است!");
      return;
    }

    const token = localStorage.getItem("access_token");
    let currentSchoolId = 1; // به جای این مقدار واقعی رو قرار بده یا prop بفرست

    const requests = rows.map((row) =>
      fetch("http://localhost:8000/api/purchases/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: row.description,
          quantity: row.quantity,
          price: row.price,
          store: row.store,
          school: currentSchoolId,
        }),
      })
    );

    try {
      const responses = await Promise.all(requests);
      if (responses.every((res) => res.ok)) {
        alert("✅ خریدها با موفقیت ثبت شدند.");
        setRows([{ description: "", quantity: 0, price: 0, store: "", total: 0 }]);
      } else {
        alert("❌ بعضی از خریدها ثبت نشدند.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ خطا در ارسال داده‌ها به سرور.");
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">ثبت خرید مدرسه</h2>
      <table className="w-full table-auto border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">شرح</th>
            <th className="p-2 border">تعداد</th>
            <th className="p-2 border">قیمت</th>
            <th className="p-2 border">فروشگاه</th>
            <th className="p-2 border">مبلغ</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="p-2 border">
                <input
                  className="w-full"
                  value={row.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full"
                  value={row.quantity}
                  onChange={(e) => handleChange(index, "quantity", Number(e.target.value))}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="w-full"
                  value={row.price}
                  onChange={(e) => handleChange(index, "price", Number(e.target.value))}
                />
              </td>
              <td className="p-2 border">
                <select
                  className="w-full"
                  value={row.store}
                  onChange={(e) => handleChange(index, "store", e.target.value)}
                >
                  <option value="">انتخاب فروشگاه</option>
                  {storeList.map((store, i) => (
                    <option key={i} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 border text-center">{row.total.toFixed(2)}</td>
              <td className="p-2 border text-center">
                <Button onClick={() => deleteRow(index)} className="bg-red-500 hover:bg-red-600">
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-2">
        <strong>جمع کل:</strong> {totalSum.toFixed(2)} تومان
        {overBudget && <span className="text-red-500 ml-4">⚠️ بیشتر از سرانه!</span>}
      </div>

      <div className="flex gap-2">
        <Button onClick={addRow}>➕ ردیف جدید</Button>
        <Button onClick={handleSubmit} disabled={rows.length === 0}>
          📤 ارسال خریدها
        </Button>
      </div>
    </Card>
  );
};

export default PurchaseTable;
