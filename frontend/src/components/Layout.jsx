import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 border-b pb-2 mb-2">{title}</h1>
          <nav className="space-x-4 space-x-reverse text-sm">
            <Link to="/manager" className="text-blue-600 hover:underline">👨‍💼 پنل مدیر</Link>
            <Link to="/school" className="text-blue-600 hover:underline">🏫 پنل مدرسه</Link>
            <Link to="/invoices" className="text-blue-600 hover:underline">🧾 فاکتورها</Link>
          </nav>
        </header>

        <div className="bg-white p-4 shadow rounded-lg space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
