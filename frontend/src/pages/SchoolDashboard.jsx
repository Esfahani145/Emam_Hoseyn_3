import React, { useState, useEffect } from "react";
import PurchaseTable from "../components/PurchaseTable";
import BudgetTable from "../components/BudgetTable";
import "../components/PurchaseTable.css";

const SchoolDashboard = () => {
  const [latestBudget, setLatestBudget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://localhost:8000/api/my_budget/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.amount) {
          setLatestBudget(data);
        } else {
          setLatestBudget(null);
        }
      })
      .catch((err) => {
        console.error("❌ error fetching latest budget:", err);
        setLatestBudget(null);
      });
  }, []);

  return (
    <div className="card">
      <h2>وضعیت سرانه اخیر</h2>
      {latestBudget ? (
        <p className="budget-info">
          📌 اخیراً سرانه‌ای از نوع <strong>{latestBudget.type}</strong> به
          مبلغ <strong>{latestBudget.amount.toLocaleString()}</strong> تومان
          تخصیص داده شده است.
        </p>
      ) : (
        <p className="budget-info" style={{ color: "#e57373" }}>
          ⚠️ هنوز سرانه‌ای برای مدرسه تخصیص داده نشده است.
        </p>
      )}

      <PurchaseTable />
      <BudgetTable />
    </div>
  );
};

export default SchoolDashboard;
