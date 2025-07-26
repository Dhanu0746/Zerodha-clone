import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const FundsCard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-4 bg-white shadow rounded-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">Funds</h2>
      <p className="text-sm text-gray-600">Available Balance:</p>
      <p className="text-2xl font-bold text-green-600">₹{user?.funds ?? 0}</p>
    </div>
  );
};

export default FundsCard;
