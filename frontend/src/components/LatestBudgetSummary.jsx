import React, { useState, useEffect } from "react";

const LatestBudgetSummary = () => {
  const [latestBudget, setLatestBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://localhost:8000/api/my_budget/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت آخرین سرانه");
        return res.json();
      })
      .then((data) => {
        // فرض شده data مقدار عددی سرانه است یا data.amount موجود است
        setLatestBudget(data.amount ?? data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>در حال بارگذاری سرانه...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="mb-6 p-4 bg-green-100 rounded text-green-800 font-semibold text-lg">
      💰 آخرین سرانه تخصیص یافته: {latestBudget.toLocaleString()} تومان
    </div>
  );
};

export default LatestBudgetSummary;
