const PlaceOrder = () => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [type, setType] = useState('market');
  const [side, setSide] = useState('buy');

  const handleSubmit = async () => {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ symbol, quantity, price, type, side })
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <input placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      {type === 'limit' && (
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
      )}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="market">Market</option>
        <option value="limit">Limit</option>
      </select>
      <select value={side} onChange={(e) => setSide(e.target.value)}>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <button onClick={handleSubmit}>Place Order</button>
    </div>
  );
};
