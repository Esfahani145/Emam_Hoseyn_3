import React, {useState, useEffect} from "react";

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [budgetTypes, setBudgetTypes] = useState({});
    const [stores, setStores] = useState({});

    const normalizeText = (text) => {
        if (!text) return "";
        return text
            .toString()
            .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)) // اعداد فارسی به انگلیسی
            .replace(/ي/g, "ی")
            .replace(/ك/g, "ک")
            .toLowerCase()
            .trim();
    };


    useEffect(() => {
        const token = localStorage.getItem("access_token");

        Promise.all([
            fetch("http://localhost:8000/api/purchases/", {
                headers: {Authorization: `Bearer ${token}`},
            }).then((res) => res.json()),
            fetch("http://localhost:8000/api/stores/", {
                headers: {Authorization: `Bearer ${token}`},
            }).then((res) => res.json()),
            fetch("http://localhost:8000/api/budget-types/", {
                headers: {Authorization: `Bearer ${token}`},
            }).then((res) => res.json()),
            fetch("http://localhost:8000/api/budgets/", {
                headers: {Authorization: `Bearer ${token}`},
            }).then((res) => res.json()),
        ])
            .then(([purchases, stores, budgetTypes, budgets]) => {
                const storeMap = Object.fromEntries(stores.map((s) => [s.id, s.name]));
                const budgetTypeMap = Object.fromEntries(
                    budgetTypes.map((b) => [b.id, b.name])
                );

                const budgetMap = {};
                budgets.forEach((b) => {
                    budgetMap[`${b.school}-${b.budget_type}`] = budgetTypeMap[b.budget_type] || "نامشخص";
                });

                const budgetBySchool = {};
                budgets.forEach(b => {
                    if (!budgetBySchool[b.school]) budgetBySchool[b.school] = b;
                });

                const purchasesWithNames = purchases.map((p) => ({
                    ...p,
                    date: p.created_at
                        ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })
                            .format(new Date(p.created_at))
                            .replace(/\//g, "-")
                        : "تاریخ نامشخص",
                    store_name: storeMap[p.store] || "نامشخص",
                    budget_type_name: budgetBySchool[p.school] ? budgetTypeMap[budgetBySchool[p.school].budget_type] : "نامشخص",
                }));

                setInvoices(purchasesWithNames);
                setLoading(false);
            })
            .catch((err) => {
                console.error("خطا در بارگذاری داده‌ها:", err);
                setLoading(false);
            });
    }, []);


    if (loading)
        return <p style={{textAlign: "center", marginTop: 40}}>در حال بارگذاری...</p>;

    const filteredInvoices = invoices.filter((inv) => {
        const searchNorm = normalizeText(search);
        return (
            normalizeText(inv.date).includes(searchNorm) ||
            normalizeText(inv.description).includes(searchNorm) ||
            normalizeText(inv.store_name).includes(searchNorm) ||
            normalizeText(inv.budget_type_name).includes(searchNorm)
        );
    });

    const containerStyle = {
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        fontFamily: "'Vazir', sans-serif",
        direction: "rtl",
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        boxShadow: "0 0 15px rgba(0,0,0,0.05)",
    };

    const thTdStyle = {
        border: "1px solid #e2e8f0",
        padding: "12px 14px",
        textAlign: "right",
        color: "#374151",
        fontSize: 14,
    };

    const thStyle = {
        backgroundColor: "#e0e7ff",
        color: "#4338ca",
        fontWeight: "bold",
    };

    return (
        <div style={containerStyle}>
            <h2 style={{fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#4f46e5"}}>
                📄 فاکتورهای قبلی
            </h2>

            <input
                type="text"
                placeholder="🔍 جستجو بر اساس تاریخ، شرح، فروشگاه یا نوع سرانه..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: 20,
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 16,
                }}
            />

            <table style={tableStyle}>
                <thead>
                <tr>
                    <th style={{...thTdStyle, ...thStyle}}>تاریخ</th>
                    <th style={{...thTdStyle, ...thStyle}}>شرح</th>
                    <th style={{...thTdStyle, ...thStyle}}>تعداد</th>
                    <th style={{...thTdStyle, ...thStyle}}>قیمت</th>
                    <th style={{...thTdStyle, ...thStyle}}>فروشگاه</th>
                    <th style={{...thTdStyle, ...thStyle}}>نوع سرانه</th>
                    <th style={{...thTdStyle, ...thStyle}}>مجموع</th>
                </tr>
                </thead>
                <tbody>
                {filteredInvoices.length === 0 ? (
                    <tr>
                        <td colSpan="7" style={{...thTdStyle, textAlign: "center", color: "#9ca3af"}}>
                            موردی یافت نشد
                        </td>
                    </tr>
                ) : (
                    filteredInvoices.map((inv, idx) => (
                        <tr
                            key={idx}
                            style={{
                                backgroundColor: idx % 2 === 0 ? "#f9fafb" : "#fff",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e7ff")}
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    idx % 2 === 0 ? "#f9fafb" : "#fff")
                            }
                        >
                            <td>{inv.date}</td>
                            <td>{inv.description}</td>
                            <td>{inv.quantity}</td>
                            <td>{inv.price?.toLocaleString()}</td>
                            <td>{inv.store_name}</td>
                            <td>{inv.budget_type_name}</td>
                            <td>
                                {inv.price && inv.quantity
                                    ? (inv.price * inv.quantity).toLocaleString() + " تومان"
                                    : "-"}
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoicesPage;
