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

    // گروه‌بندی بر اساس نوع سرانه و سپس مدرسه
    const groupedInvoices = invoices.reduce((acc, invoice) => {
        const type = invoice.budget_type || "نامشخص";
        const schoolId = invoice.school || "نامشخص";

        if (!acc[type]) acc[type] = {};
        if (!acc[type][schoolId]) acc[type][schoolId] = [];

        acc[type][schoolId].push(invoice);
        return acc;
    }, {});

    return (
        <div
            style={{
                maxWidth: 700,
                margin: "40px auto",
                fontFamily: "Tahoma, sans-serif",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: 20,
                    color: "#333",
                }}
            >
                خلاصه فاکتورها
            </h2>

            {Object.entries(groupedInvoices).map(([type, schoolsGroup]) =>
                Object.entries(schoolsGroup).map(([schoolId, group]) => {
                    const schoolName = schools[schoolId] || "نامشخص";
                    const itemsText = group.map((p) => p.description).join("، ");
                    const totalAmount = group.reduce(
                        (sum, p) => sum + p.price * p.quantity,
                        0
                    );

                    return (
                        <div
                            key={`${type}-${schoolId}`}
                            style={{
                                marginBottom: 40,
                                padding: 20,
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                backgroundColor: "#fafafa",
                                boxShadow: "0 0 8px rgba(0,0,0,0.05)",
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: 12,
                                    color: "#444",
                                    borderBottom: "1px solid #ccc",
                                    paddingBottom: 6,
                                }}
                            >
                                نوع سرانه: {type} - مدرسه: {schoolName}
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
                                    <th style={{padding: 12, border: "1px solid #ccc"}}>
                                        مدرسه
                                    </th>
                                    <th style={{padding: 12, border: "1px solid #ccc"}}>
                                        شرح اقلام
                                    </th>
                                    <th style={{padding: 12, border: "1px solid #ccc"}}>
                                        مبلغ کل
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr style={{backgroundColor: "#fff"}}>
                                    <td style={{padding: 12, border: "1px solid #ccc"}}>
                                        {schoolName}
                                    </td>
                                    <td style={{padding: 12, border: "1px solid #ccc"}}>
                                        {itemsText}
                                    </td>
                                    <td style={{padding: 12, border: "1px solid #ccc"}}>
                                        {totalAmount.toLocaleString()} تومان
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default InvoiceSummary;
