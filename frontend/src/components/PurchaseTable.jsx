import React, {useState, useEffect} from "react";
import LatestBudgetSummary from "./LatestBudgetSummary";
import "./PurchaseTable.css";

const PurchaseTable = () => {
    const [rows, setRows] = useState([
        {description: "", quantity: 0, price: 0, store: "", total: 0},
    ]);
    const [schoolBudget, setSchoolBudget] = useState(null);
    const [storeList, setStoreList] = useState([]);
    const [refreshBudget, setRefreshBudget] = useState(false);
    const [budgetType, setBudgetType] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        fetch("http://localhost:8000/api/my_budget/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("خطا در دریافت سرانه");
                return res.json();
            })
            .then((data) => {
                setSchoolBudget(Number(data.amount));
                setBudgetType(data.type);
            })
            .catch((err) => console.error("❌ error fetching budget:", err));

        fetch("http://localhost:8000/api/stores/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setStoreList(data))
            .catch((err) => console.error("❌ error loading stores:", err));
    }, [refreshBudget]);

    const addRow = () => {
        setRows([
            ...rows,
            {description: "", quantity: 0, price: 0, store: "", total: 0},
        ]);
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        let updatedRow = {...newRows[index], [field]: value};

        // تبدیل مقدار quantity و price به عدد و جلوگیری از NaN
        const quantity = field === "quantity" ? Number(value) : Number(updatedRow.quantity);
        const price = field === "price" ? Number(value) : Number(updatedRow.price);

        updatedRow.quantity = isNaN(quantity) ? 0 : quantity;
        updatedRow.price = isNaN(price) ? 0 : price;

        updatedRow.total = updatedRow.quantity * updatedRow.price;
        newRows[index] = updatedRow;
        setRows(newRows);
    };

    const deleteRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        // حداقل یک ردیف باقی بگذار
        if (newRows.length === 0) {
            newRows.push({description: "", quantity: 0, price: 0, store: "", total: 0});
        }
        setRows(newRows);
    };

    const totalSum = rows.reduce((sum, r) => sum + r.total, 0);
    const overBudget = schoolBudget !== null && totalSum > schoolBudget;

    const validateRows = () => {
        for (let i = 0; i < rows.length; i++) {
            const {description, quantity, price, store} = rows[i];
            if (!description.trim()) {
                alert(`شرح ردیف ${i + 1} وارد نشده است.`);
                return false;
            }
            if (quantity <= 0) {
                alert(`تعداد ردیف ${i + 1} باید بیشتر از صفر باشد.`);
                return false;
            }
            if (price <= 0) {
                alert(`قیمت ردیف ${i + 1} باید بیشتر از صفر باشد.`);
                return false;
            }
            if (!store) {
                alert(`فروشگاه ردیف ${i + 1} انتخاب نشده است.`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (overBudget) {
            alert("⚠️ مجموع هزینه‌ها از مقدار سرانه بیشتر است!");
            return;
        }

        if (!validateRows()) return;

        const token = localStorage.getItem("access_token");
        let currentSchoolId = 1;

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
            let allOk = true;

            for (const res of responses) {
                if (!res.ok) {
                    allOk = false;
                    const errorData = await res.json();
                    console.error("خطای سرور:", errorData);
                }
            }

            if (allOk) {
                alert("✅ خریدها با موفقیت ثبت شدند.");
                setRefreshBudget((prev) => !prev);
                // پاک کردن جدول بعد از ثبت موفق
                setRows([{description: "", quantity: 0, price: 0, store: "", total: 0}]);
            } else {
                alert("❌ بعضی از خریدها ثبت نشدند. لطفاً کنسول را بررسی کنید.");
            }
        } catch (error) {
            console.error(error);
            alert("❌ خطا در ارسال داده‌ها به سرور.");
        }
    };

    return (
        <>
            <LatestBudgetSummary/>

            <div className="card">
                <h2>ثبت خرید مدرسه</h2>

                {schoolBudget !== null && (
                    <p className="budget-info">
                        💰 سرانه مدرسه: {schoolBudget.toLocaleString()} تومان
                        <br/>
                        📌 نوع سرانه: {budgetType}
                    </p>
                )}

                <table>
                    <thead>
                    <tr>
                        <th>شرح</th>
                        <th>تعداد</th>
                        <th>قیمت</th>
                        <th>فروشگاه</th>
                        <th>مبلغ</th>
                        <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    value={row.description}
                                    onChange={(e) =>
                                        handleChange(index, "description", e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min={0}
                                    value={row.quantity}
                                    onChange={(e) =>
                                        handleChange(index, "quantity", e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min={0}
                                    value={row.price}
                                    onChange={(e) =>
                                        handleChange(index, "price", e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <select
                                    value={row.store}
                                    onChange={(e) => handleChange(index, "store", e.target.value)}
                                >
                                    <option value="">انتخاب فروشگاه</option>
                                    {storeList.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="total-cell">
                                {typeof row.total === "number" ? row.total.toLocaleString() : "-"}
                            </td>
                            <td className="actions-cell">
                                <button
                                    onClick={() => deleteRow(index)}
                                    className="button button-danger"
                                    disabled={rows.length === 1}
                                    title={
                                        rows.length === 1
                                            ? "حداقل یک ردیف باید وجود داشته باشد"
                                            : "حذف ردیف"
                                    }
                                >
                                    حذف
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="summary">
                    جمع کل: {totalSum.toLocaleString()} تومان{" "}
                    {overBudget && <span className="over-budget">⚠️ بیشتر از سرانه!</span>}
                </div>

                <div className="button-group">
                    <button onClick={addRow} className="button">
                        ➕ ردیف جدید
                    </button>
                    <button onClick={handleSubmit} className="button" disabled={rows.length === 0}>
                        📤 ارسال خریدها
                    </button>
                </div>
            </div>
        </>
    );
};

export default PurchaseTable;
