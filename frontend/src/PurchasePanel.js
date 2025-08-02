import React, { useState, useEffect } from 'react';

const PurchasePanel = () => {
  const [quota, setQuota] = useState(0); // سرانه اختصاص داده شده
  const [purchases, setPurchases] = useState([
    { description: '', quantity: 0, price: 0, store: '' }
  ]);
  const [stores, setStores] = useState([
    { id: 1, name: 'فروشگاه الف' },
    { id: 2, name: 'فروشگاه ب' }
  ]);

  useEffect(() => {
    // فرضاً این مقدار از پنل backend یا template context بیاد
    setQuota(1000000); // مثلا 1 میلیون تومان
  }, []);

  const updatePurchase = (index, field, value) => {
    const newPurchases = [...purchases];
    newPurchases[index][field] = field === 'quantity' || field === 'price' ? parseInt(value) || 0 : value;
    setPurchases(newPurchases);
  };

  const addRow = () => {
    setPurchases([...purchases, { description: '', quantity: 0, price: 0, store: '' }]);
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const remaining = quota - totalSpent;

  const overBudget = remaining < 0;

  return (
    <div>
      <h2>پنل مدرسه - ثبت خرید</h2>
      <p>سرانه اختصاص‌یافته: {quota.toLocaleString()} تومان</p>
      <p>مجموع هزینه‌ها: {totalSpent.toLocaleString()} تومان</p>
      <p style={{ color: overBudget ? 'red' : 'green' }}>
        {overBudget ? `هشدار: از سرانه بیشتر خرج کرده‌اید! (${remaining.toLocaleString()}-)` :
          `باقیمانده سرانه: ${remaining.toLocaleString()} تومان`}
      </p>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>شرح</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>فروشگاه</th>
            <th>مبلغ کل</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p, i) => (
            <tr key={i}>
              <td><input value={p.description} onChange={(e) => updatePurchase(i, 'description', e.target.value)} /></td>
              <td><input type="number" value={p.quantity} onChange={(e) => updatePurchase(i, 'quantity', e.target.value)} /></td>
              <td><input type="number" value={p.price} onChange={(e) => updatePurchase(i, 'price', e.target.value)} /></td>
              <td>
                <select value={p.store} onChange={(e) => updatePurchase(i, 'store', e.target.value)}>
                  <option value="">--</option>
                  {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </td>
              <td>{(p.quantity * p.price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>افزودن ردیف</button>
    </div>
  );
};

export default PurchasePanel;
