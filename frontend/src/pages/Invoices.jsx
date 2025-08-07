import React, { useState } from 'react';
import Layout from '../components/Layout';
import moment from 'moment-jalaali';

function Invoices({ invoices, schools, budgets, fetchInvoices }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  if (!schools || !budgets) {
    return (
      <Layout title="🧾 لیست خریدها">
        <div className="flex justify-center items-center h-48 text-gray-600">
          داده‌های مورد نیاز بارگذاری نشده‌اند.
        </div>
      </Layout>
    );
  }

  const handleSearch = () => {
    if (startDate && endDate) {
      fetchInvoices(startDate, endDate);
      setError(null);
    } else {
      setError('لطفا هر دو تاریخ را وارد کنید');
    }
  };

  const printTable = () => {
    window.print();
  };

  const schoolCosts = invoices.reduce((acc, invoice) => {
    const total = invoice.quantity * invoice.price;
    acc[invoice.school] = (acc[invoice.school] || 0) + total;
    return acc;
  }, {});

  return (
    <Layout title="🧾 لیست خریدها">
      <div
        className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md
          hover:shadow-lg transition-shadow duration-300
          font-vazir text-gray-700 rtl"
        style={{ direction: 'rtl' }}
      >
        {/* جستجو */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            جستجو بر اساس تاریخ (شمسی)
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="date"
              className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition-colors duration-200"
            >
              جستجو
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-3 text-sm font-medium">{error}</p>
          )}
        </section>

        {/* دکمه چاپ */}
        <button
          onClick={printTable}
          className="mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors duration-200"
        >
          🖨 چاپ لیست خریدها
        </button>

        {/* خلاصه هزینه‌ها */}
        <section className="printable">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💸 خلاصه هزینه‌ها به تفکیک مدرسه</h2>

          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 border border-gray-300 font-semibold">مدرسه</th>
                <th className="p-3 border border-gray-300 font-semibold">بودجه (تومان)</th>
                <th className="p-3 border border-gray-300 font-semibold">هزینه‌شده</th>
                <th className="p-3 border border-gray-300 font-semibold">باقی‌مانده / بدهی</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(schoolCosts).map((schoolId) => {
                const cost = schoolCosts[schoolId];
                const budget = budgets[schoolId] || 0;
                const diff = budget - cost;
                const isDebt = diff < 0;
                return (
                  <tr
                    key={schoolId}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <td className="p-3 border border-gray-300">{schools[schoolId] || 'نامشخص'}</td>
                    <td className="p-3 border border-gray-300">{budget.toLocaleString()}</td>
                    <td className="p-3 border border-gray-300">{cost.toLocaleString()}</td>
                    <td
                      className={`p-3 border border-gray-300 font-semibold ${
                        isDebt ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {(isDebt ? '-' : '+') + Math.abs(diff).toLocaleString()}{' '}
                      {isDebt ? 'بدهی' : 'باقی‌مانده'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* جدول جزئیات خرید */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">📋 لیست جزئیات خرید</h2>
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="bg-gray-300 text-gray-900">
                  <th className="p-3 border border-gray-400 font-semibold">مدرسه</th>
                  <th className="p-3 border border-gray-400 font-semibold">فروشگاه</th>
                  <th className="p-3 border border-gray-400 font-semibold">توضیح</th>
                  <th className="p-3 border border-gray-400 font-semibold">تعداد</th>
                  <th className="p-3 border border-gray-400 font-semibold">قیمت</th>
                  <th className="p-3 border border-gray-400 font-semibold">جمع</th>
                  <th className="p-3 border border-gray-400 font-semibold">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr
                    key={i.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-150 cursor-default"
                  >
                    <td className="p-3 border border-gray-400">{schools[i.school] || 'نامشخص'}</td>
                    <td className="p-3 border border-gray-400">{i.store_name || '-'}</td>
                    <td className="p-3 border border-gray-400">{i.description}</td>
                    <td className="p-3 border border-gray-400">{i.quantity}</td>
                    <td className="p-3 border border-gray-400">{i.price.toLocaleString()}</td>
                    <td className="p-3 border border-gray-400">{(i.quantity * i.price).toLocaleString()}</td>
                    <td className="p-3 border border-gray-400">
                      {moment(i.created_at).format('jYYYY/jMM/jDD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable, .printable * {
            visibility: visible;
          }
          .printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          button, input {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}

export default Invoices;
