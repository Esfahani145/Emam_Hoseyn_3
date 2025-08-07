import React from "react";

function InvoiceSummary({invoices, schools}) {
    if (!invoices.length) {
        return (
            <p
                style={{
                    textAlign: "center",
                    marginTop: 40,
                    fontFamily: "Tahoma, sans-serif",
                    color: "#555",
                }}
            >
                فاکتوری موجود نیست
            </p>
        );
    }

    // گروه‌بندی فاکتورها بر اساس نوع سرانه
    // فرض می‌کنیم هر فاکتور یک فیلد type یا budget_type داره که نوع سرانه است
    const groupedInvoices = invoices.reduce((acc, invoice) => {
        const type = invoice.budget_type || "نامشخص";
        if (!acc[type]) acc[type] = [];
        acc[type].push(invoice);
        return acc;
    }, {});

    return (
        <div style={{maxWidth: 700, margin: "40px auto", fontFamily: "Tahoma, sans-serif"}}>
            <h2 style={{textAlign: "center", marginBottom: 20, color: "#333"}}>خلاصه فاکتورها</h2>

            {Object.entries(groupedInvoices).map(([type, group]) => {
                const schoolName = schools[group[0].school] || "نامشخص";
                const itemsText = group.map((p) => p.description).join("، ");
                const totalAmount = group.reduce((sum, p) => sum + p.price * p.quantity, 0);

                return (
                    <div
                        key={type}
                        style={{
                            marginBottom: 40,
                            padding: 20,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            backgroundColor: "#fafafa",
                            boxShadow: "0 0 8px rgba(0,0,0,0.05)",
                        }}
                    >
                        <h3 style={{marginBottom: 12, color: "#444", borderBottom: "1px solid #ccc", paddingBottom: 6}}>
                            نوع سرانه: {type}
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                textAlign: "right",
                                color: "#444",
                            }}
                        >
                            <thead>
                            <tr style={{backgroundColor: "#e8e8e8"}}>
                                <th style={{padding: 12, border: "1px solid #ccc"}}>مدرسه</th>
                                <th style={{padding: 12, border: "1px solid #ccc"}}>شرح اقلام</th>
                                <th style={{padding: 12, border: "1px solid #ccc"}}>مبلغ کل</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr style={{backgroundColor: "#fff"}}>
                                <td style={{padding: 12, border: "1px solid #ccc"}}>{schoolName}</td>
                                <td style={{padding: 12, border: "1px solid #ccc"}}>{itemsText}</td>
                                <td style={{
                                    padding: 12,
                                    border: "1px solid #ccc"
                                }}>{totalAmount.toLocaleString()} تومان
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}

export default InvoiceSummary;
