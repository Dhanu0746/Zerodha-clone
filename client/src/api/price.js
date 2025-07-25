import api from './axios';

export const fetchLivePrice = async (symbol) => {
  const res = await api.get(`/stock/price/${symbol}`);
  return res.data.price;
}; 