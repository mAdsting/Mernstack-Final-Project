import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HousesPage() {
  const navigate = useNavigate();

  // Remove unused imports and state
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Houses/Flats</h2>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-gray-500 text-center">Visualization is now available on the property detail page. Select a property from 'My Properties' to view details and visualize flats.</div>
      </div>
    </div>
  );
}

export default HousesPage; 