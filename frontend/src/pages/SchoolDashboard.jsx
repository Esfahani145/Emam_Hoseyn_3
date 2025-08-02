import React from 'react';
import PurchaseTable from '../components/PurchaseTable';
import StoreSelector from '../components/StoreSelector';

function SchoolDashboard() {
  return (
    <div className="p-4">
      <h2 className="text-xl">پنل مدرسه</h2>
      <StoreSelector />
      <PurchaseTable />
    </div>
  );
}

export default SchoolDashboard;
