import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const fetchHoldings = async () => {
      const token = localStorage.getItem('token'); // ✅ Define token here
      try {
        const response = await axios.get('http://localhost:5000/api/holding', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Holdings response:", response.data);
        setHoldings(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching holdings:', error);
        setHoldings([]);
      }
    };

    fetchHoldings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Holdings</h2>

      {holdings.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No holdings available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holdings.map((holding, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">{holding.symbol}</h3>
              <p className="text-gray-600">Quantity: {holding.quantity}</p>
              <p className="text-gray-600">
                Avg. Price: ₹{holding.averagePrice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Holdings;
