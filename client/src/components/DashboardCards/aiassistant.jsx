import React from 'react';

const AiAssistantCard = () => {
  const handleClick = () => {
    // trigger AI assistant logic
    alert('AI Assistant triggered 🚀');
  };

  return (
    <div className="p-4 bg-white shadow rounded-2xl w-full text-center">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Ask AI Assistant
      </button>
    </div>
  );
};

export default AiAssistantCard;
