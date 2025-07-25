import React from "react";

const Support = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-24 text-gray-800">
      <h1 className="text-4xl font-semibold mb-8">Support</h1>
      <p className="text-lg mb-6">
        Find answers to your questions or get in touch with our support team.
      </p>
      <div className="border rounded-md p-6 shadow-md">
        <h2 className="text-xl font-medium mb-2">Help Center</h2>
        <p className="text-gray-600">
          Visit our extensive help portal for guides, FAQs, and ticket support.
        </p>
        <a
          href="https://support.zerodha.com"
          className="inline-block mt-4 text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Support Portal →
        </a>
      </div>
    </div>
  );
};

export default Support;
