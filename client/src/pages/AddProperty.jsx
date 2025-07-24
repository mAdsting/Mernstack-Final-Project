import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../services/api';

const steps = [
  'Compound',
  'Units/Rooms',
  'Amenities',
  'Images',
  'Review',
];

function AddProperty() {
  // --- State ---
  const [step, setStep] = useState(0);
  const [compound, setCompound] = useState({ name: '', location: '' });
  const [submitMsg, setSubmitMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const basicAmenities = [
    'Parking',
    'Security (CCTV/Guards)',
    'Internet/WiFi',
    'Swimming Pool',
    'Gym/Fitness Center',
    'Laundry Area',
    'Balcony',
    'Elevator/Lift',
    'Playground',
    'Garden',
    'Pet-friendly',
    'Wheelchair Accessible',
    'Garbage Collection',
    'Fire Safety',
    'Borehole/Well',
    'Solar Power',
    'Servant Quarters',
    'Storage Room',
    'Furnished',
  ];
  const [newBlockLabel, setNewBlockLabel] = useState('');
  const [newBlockFloors, setNewBlockFloors] = useState(1);
  const [newBlockUnitsPerFloor, setNewBlockUnitsPerFloor] = useState(1);
  const [newBlockRent, setNewBlockRent] = useState('');
  const [newBlockType, setNewBlockType] = useState('bedsitter');
  // Add state for number of floors and houses per floor
  const [numFloors, setNumFloors] = useState(1);
  const [housesPerFloor, setHousesPerFloor] = useState(1);

  // --- Handlers ---
  function handleAmenityChange(amenity) {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }
  function handleAddBlock() {
    if (Number(newBlockFloors) < 1 || Number(newBlockUnitsPerFloor) < 1) return;
    const block = newBlockLabel.trim();
    const numFloors = Number(newBlockFloors) || 1;
    const unitsPerFloor = Number(newBlockUnitsPerFloor) || 1;
    const rent = newBlockRent !== '' ? newBlockRent : ''; // No default rent for now
    const type = newBlockType || 'bedsitter';
    const newUnits = [];
    for (let f = 0; f < numFloors; f++) {
      const floorLabel = f === 0 ? 'G' : f;
      for (let u = 0; u < unitsPerFloor; u++) {
        const unitLabel = block ? block + (floorLabel + (f === 0 ? (u + 1) : String.fromCharCode(65 + u))) : (floorLabel + (f === 0 ? (u + 1) : String.fromCharCode(65 + u)));
        newUnits.push({ label: unitLabel, type, rent, block, numFloors, unitsPerFloor, floor: f });
      }
    }
    // This part of the logic is now handled by the main grid, so we just add the units
    // setDirectUnits(us => [...us, ...newUnits]); // This line is no longer needed
    setNewBlockLabel('');
    setNewBlockFloors(1);
    setNewBlockUnitsPerFloor(1);
    setNewBlockRent('');
    setNewBlockType('bedsitter');
    setSubmitMsg(`${newUnits.length} unit(s) added!`);
  }

  // --- Render Functions ---
  // Step 1: Compound Details
  function renderCompoundDetails() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Compound/Property Name</label>
          <input type="text" className="w-full border rounded p-2" value={compound.name} onChange={e => setCompound(c => ({ ...c, name: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" className="w-full border rounded p-2" value={compound.location} onChange={e => setCompound(c => ({ ...c, location: e.target.value }))} required />
        </div>
      </div>
    );
  }

  // Step 2: Minimalist Quick Add
  function renderQuickAddUnits() {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Floors</label>
          <input type="number" min={1} className="w-full border rounded p-2" value={numFloors} onChange={e => setNumFloors(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Houses per Floor</label>
          <input type="number" min={1} className="w-full border rounded p-2" value={housesPerFloor} onChange={e => setHousesPerFloor(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Units</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded p-2"
            value={newBlockFloors}
            onChange={e => setNewBlockFloors(Number(e.target.value))}
            required
          />
          <div className="text-xs text-gray-500 mt-1">All units will use the default rent and type below. You can edit units in detail later.</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Default Rent for All Units</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded p-2"
            value={newBlockRent}
            onChange={e => setNewBlockRent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Default Unit Type</label>
          <select
            className="w-full border rounded p-2"
            value={newBlockType}
            onChange={e => setNewBlockType(e.target.value)}
          >
            <option value="bedsitter">Bedsitter</option>
            <option value="1br">1 Bedroom</option>
            <option value="2br">2 Bedroom</option>
            <option value="3br">3 Bedroom</option>
            <option value="3br+sq">3 Bedroom + SQ</option>
          </select>
        </div>
      </div>
    );
  }

  function renderAmenities() {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Select Amenities</h2>
        <div className="grid grid-cols-2 gap-4">
          {basicAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: Review
  function renderReview() {
    return (
      <div className="space-y-4">
        <div><b>Compound:</b> {compound.name}</div>
        <div><b>Location:</b> {compound.location}</div>
        <div><b>Amenities:</b> {amenities.length > 0 ? amenities.join(', ') : 'None selected'}</div>
        <div className="text-xs text-gray-400">(Unit details will be shown here.)</div>
      </div>
    );
  }

  // Step navigation
  function handleNext() {
    setStep(s => s + 1);
  }
  function handleBack() {
    setStep(s => s - 1);
  }
  // Submit handler
  function handleSubmit() {
    if (loading) return;
    if (!compound.name || !compound.location) {
      setSubmitMsg('Please enter compound name and location.');
      return;
    }
    if (!newBlockFloors || !newBlockRent || !newBlockType) {
      setSubmitMsg('Please fill in all unit details.');
      return;
    }
    setLoading(true);
    setSubmitMsg('');
    // Generate units array
    const units = [];
    for (let floor = 0; floor < numFloors; floor++) {
      for (let h = 1; h <= housesPerFloor; h++) {
        let label;
        if (floor === 0) {
          label = `G${h}`;
        } else {
          // Floor 1: 101, 102, ...; Floor 2: 201, 202, ...
          label = `${floor}${h.toString().padStart(2, '0')}`;
        }
        units.push({
          label,
          type: newBlockType,
          rent: newBlockRent,
          floor,
        });
      }
    }
    console.log('Generated units:', units);
    fetch('/api/properties', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: compound.name,
        location: compound.location,
        type: 'flat',
        numUnits: newBlockFloors,
        amenities,
        units,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error adding property');
        setSubmitMsg('Property added successfully!');
        setTimeout(() => {
          setLoading(false);
          setSubmitMsg('');
          // window.location.href = '/properties'; // Temporarily comment out redirect for debugging
        }, 1000);
      })
      .catch((err) => {
        setLoading(false);
        setSubmitMsg(err.message || 'Error adding property');
      });
  }

  // Main render
  return (
    <div className="max-w-4xl w-full mx-auto p-0 bg-transparent shadow-none mt-8">
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 flex items-center ${i < step ? 'text-green-600' : i === step ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 ${i <= step ? 'border-indigo-600 bg-indigo-100' : 'border-gray-300 bg-gray-50'}`}>{i + 1}</div>
            <div className="ml-2 font-semibold">{s}</div>
            {i < steps.length - 1 && <div className="flex-1 h-1 mx-2 bg-gray-200 rounded" />}
          </div>
        ))}
      </div>
      {step === 0 && renderCompoundDetails()}
      {step === 1 && renderQuickAddUnits()}
      {step === 2 && renderAmenities()}
      {step === 4 && renderReview()}
      {submitMsg && <div className={`my-2 text-center text-sm ${submitMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{submitMsg}</div>}
      <div className="flex justify-between mt-8">
        {step > 0 && <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={handleBack} disabled={loading}>Back</button>}
        {step < 4 && <button type="button" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleNext} disabled={loading}>Next</button>}
        {step === 4 && <button type="button" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={handleSubmit} disabled={loading}>Add Flats</button>}
      </div>
    </div>
  );
}

export default AddProperty;

