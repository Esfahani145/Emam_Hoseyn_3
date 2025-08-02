import React, {useEffect, useState} from 'react';

const StoreSelector = () => {
    const [storeList, setStoreList] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        fetch("http://localhost:8000/api/stores/", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch stores");
                return res.json();
            })
            .then((data) => {
                console.log("📦 Stores fetched:", data);
                setStoreList(data);
            })
            .catch((err) => {
                console.error("❌ Error fetching stores:", err);
            });
    }, []);

    const handleChange = (e) => {
        const selectedId = e.target.value;
        setSelectedStoreId(selectedId);
        console.log("✅ Store selected:", selectedId);

        const token = localStorage.getItem("access_token");

        fetch("http://localhost:8000/api/select_store/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({store: selectedId}),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to select store");
                return res.json();
            })
            .then((data) => {
                console.log("📌 Store selection saved:", data);
                alert("✅ فروشگاه ثبت شد");
            })
            .catch((err) => {
                console.error("❌ Error saving store:", err);
                alert("خطا در ثبت فروشگاه");
            });
    };


    return (
        <div>
            <label htmlFor="storeSelect">انتخاب فروشگاه:</label>
            <select
                id="storeSelect"
                value={selectedStoreId}
                onChange={handleChange}
            >
                <option value="">-- انتخاب کنید --</option>
                {storeList.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name}
                    </option>
                ))}
            </select>

            {selectedStoreId && (
                <p>🛒 فروشگاه انتخاب‌شده: {storeList.find(s => s.id == selectedStoreId)?.name}</p>
            )}
        </div>
    );
};

export default StoreSelector;
