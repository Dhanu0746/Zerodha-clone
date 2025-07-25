import React from "react";

const products = [
  {
    name: "Kite",
    desc: "Trading platform",
    img: "https://zerodha.com/static/images/products/kite.png",
  },
  {
    name: "Console",
    desc: "Backoffice platform",
    img: "https://zerodha.com/static/images/products/console.png",
  },
  {
    name: "Coin",
    desc: "Mutual funds platform",
    img: "https://zerodha.com/static/images/products/coin.png",
  },
  {
    name: "Varsity",
    desc: "Free education",
    img: "https://zerodha.com/static/images/products/varsity.png",
  },
];

const Products = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-24 text-gray-800">
      <h1 className="text-4xl font-semibold mb-10">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {products.map((p) => (
          <div
            key={p.name}
            className="flex items-center space-x-6 border p-6 rounded-md shadow-sm"
          >
            <img src={p.img} alt={p.name} className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-medium">{p.name}</h2>
              <p className="text-gray-600">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
