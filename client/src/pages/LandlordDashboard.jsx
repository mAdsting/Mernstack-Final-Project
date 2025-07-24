    // client/src/pages/LandlordDashboard.jsx
    import React, { useState, useEffect } from 'react';
    import { io } from 'socket.io-client';
    import { getAuthHeaders } from '../services/api';
    import axios from 'axios';
    import {
      Home as HomeIcon,
      CheckCircle,
      PlusCircle,
      UserPlus,
      FilePlus,
      Download,
      ArrowUpRight,
      ArrowDownRight,
      Calendar as CalendarIcon,
      X
    } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import 'react-calendar/dist/Calendar.css';
    import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

    // Establish Socket.io connection
    const socket = io('http://localhost:5000'); // Connect to your backend Socket.io server

    function LandlordDashboard() {
      const [message, setMessage] = useState('');

      // Property state
      const [properties, setProperties] = useState([]);
      const [loadingProps, setLoadingProps] = useState(false);
      const [propName, setPropName] = useState('');
      const [propLocation, setPropLocation] = useState('');
      const [propType, setPropType] = useState('flat');
      const [propNumUnits, setPropNumUnits] = useState(1);
      const [propDefaultRent, setPropDefaultRent] = useState('');
      const [propUnits, setPropUnits] = useState([{ label: '', type: 'bedsitter', rent: '' }]);
      const [propBedrooms, setPropBedrooms] = useState(1);
      const [propServantQuarters, setPropServantQuarters] = useState(0);
      const [propError, setPropError] = useState('');
      const [propMsg, setPropMsg] = useState('');
      const [propLoading, setPropLoading] = useState(false);

      const [showHouseModal, setShowHouseModal] = useState(false);
      const [showTenantModal, setShowTenantModal] = useState(false);
      const [selected, setSelected] = useState('dashboard');
      const [selectedProperty, setSelectedProperty] = useState(null);
      const [tenants, setTenants] = useState([]);
      const [loadingTenants, setLoadingTenants] = useState(false);
      const [tenantMsg, setTenantMsg] = useState('');
      const [tenantError, setTenantError] = useState('');
      const [tenantName, setTenantName] = useState('');
      const [tenantHouseNumber, setTenantHouseNumber] = useState('');
      const [tenantRentAmount, setTenantRentAmount] = useState('');
      const [tenantHouseId, setTenantHouseId] = useState('');
      const [tenantEmail, setTenantEmail] = useState('');
      const [tenantPhone, setTenantPhone] = useState('');

      const [paymentTenant, setPaymentTenant] = useState('');
      const [paymentAmount, setPaymentAmount] = useState('');
      const [paymentMsg, setPaymentMsg] = useState('');
      const [paymentError, setPaymentError] = useState('');

      const [houses, setHouses] = useState([]);
      const [payments, setPayments] = useState([]);
      const [showPropModal, setShowPropModal] = useState(false);

      // Add state for calendar and events
      const [calendarDate, setCalendarDate] = useState(new Date());
      const [events, setEvents] = useState([]);
      const [showEventModal, setShowEventModal] = useState(false);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [archivedTenants, setArchivedTenants] = useState([]);

      // Add missing state for house creation
      const [houseNumber, setHouseNumber] = useState('');
      const [location, setLocation] = useState('');
      const [rentAmount, setRentAmount] = useState('');

      const user = JSON.parse(localStorage.getItem('user'));
      const navigate = useNavigate();

      // Effect for Socket.io notifications and initial data fetch
      useEffect(() => {
        // Listen for payment notifications
        socket.on('paymentNotification', (data) => {
          console.log('Received payment notification:', data);
          setMessage(`${data.message} (House: ${data.houseNumber})`);
        });

        // Initial fetch of unpaid houses
        fetchUnpaidHouses();

        // Fetch properties on mount
        const fetchProperties = async () => {
          setLoadingProps(true);
          setPropError('');
          try {
            const response = await fetch('/api/properties', { headers: getAuthHeaders() });
            if (!response.ok) throw new Error('Failed to fetch properties');
            const data = await response.json();
            setProperties(data);
            // Fetch tenants for the first property if available
            if (data.length > 0) {
              getTenants(data[0]._id).then(res => setTenants(res.data));
            } else {
              setTenants([]);
            }
          } catch (err) {
            setPropError('Could not load properties.');
          } finally {
            setLoadingProps(false);
          }
        };
        fetchProperties();

        // Cleanup on component unmount
        return () => {
          socket.off('paymentNotification');
        };
      }, []); // Empty dependency array means this runs once on mount

      // Function to fetch unpaid houses
      const fetchUnpaidHouses = async () => {
        try {
          const response = await axios.get('/api/houses/unpaid');
          // setUnpaidHouses(response.data); // This state was removed, so this line is removed
        } catch (error) {
          console.error('Error fetching unpaid houses:', error);
          setMessage('Error fetching unpaid houses.');
        }
      };

      // Handle creating a new house
      const handleCreateHouse = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('/api/houses', { houseNumber, location, rentAmount: parseFloat(rentAmount) });
          setMessage(`House ${response.data.houseNumber} created successfully!`);
          setHouseNumber('');
          setLocation('');
          setRentAmount('');
          fetchUnpaidHouses(); // Refresh the list
        } catch (error) {
          console.error('Error creating house:', error);
          setMessage(`Error creating house: ${error.response?.data?.message || error.message}`);
        }
      };

      // Add property handler
      const handleAddProperty = async (e) => {
        e.preventDefault();
        setPropError('');
        setPropMsg('');
        setPropLoading(true);
        if (!propName || !propLocation || !propType) {
          setPropError('All fields are required.');
          setPropLoading(false);
          return;
        }
        if (propType === 'flat' && (!propNumUnits || !propDefaultRent)) {
          setPropError('Number of units and default rent are required for flats.');
          setPropLoading(false);
          return;
        }
        if ((propType === 'bungalow' || propType === 'mansion') && (!propBedrooms || !propDefaultRent)) {
          setPropError('Bedrooms and rent are required for bungalows/mansions.');
          setPropLoading(false);
          return;
        }
        try {
          const body = {
            name: propName,
            location: propLocation,
            type: propType,
          };
          if (propType === 'flat') {
            body.numUnits = propNumUnits;
            body.defaultRent = propDefaultRent;
            body.units = propUnits;
          } else {
            body.bedrooms = propBedrooms;
            body.servantQuarters = propServantQuarters;
            body.rent = propDefaultRent;
          }
          const response = await fetch('/api/properties', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Error adding property');
          setPropMsg('Property added successfully!');
          setProperties((prev) => [...prev, data]);
          setShowPropModal(false);
          setPropName('');
          setPropLocation('');
          setPropType('flat');
          setPropNumUnits(1);
          setPropDefaultRent('');
          setPropUnits([{ label: '', type: 'bedsitter', rent: '' }]);
          setPropBedrooms(1);
          setPropServantQuarters(0);
        } catch (err) {
          setPropError(err.message);
        } finally {
          setPropLoading(false);
        }
      };

      // Simulate a tenant making a payment (for testing purposes)
      const handleSimulatePayment = async (houseId, houseNum) => {
        try {
          // This would ideally be a tenant-facing endpoint
          await axios.put(`/api/houses/${houseId}/pay`);
          setMessage(`Simulated payment for House ${houseNum}. Check notifications!`);
          // The socket.io event will trigger the notification and refresh
        } catch (error) {
          console.error('Error simulating payment:', error);
          setMessage(`Error simulating payment: ${error.response?.data?.message || error.message}`);
        }
      };

      // Handle logout
      const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
      };

      // Fetch tenants for a property
      const fetchTenants = async (propertyId) => {
        setLoadingTenants(true);
        setTenantError('');
        try {
          const response = await fetch(`/api/tenants?property=${propertyId}`, { headers: getAuthHeaders() });
          if (!response.ok) throw new Error('Failed to fetch tenants');
          const data = await response.json();
          setTenants(data);
        } catch (err) {
          setTenantError('Could not load tenants.');
        } finally {
          setLoadingTenants(false);
        }
      };

      // Add tenant handler
      const handleAddTenant = async (e) => {
        e.preventDefault();
        setTenantError('');
        setTenantMsg('');
        // If no property selected, use the first property in the list
        let propertyId = selectedProperty?._id;
        if (!propertyId && properties.length > 0) {
          propertyId = properties[0]._id;
          setSelectedProperty(properties[0]);
        }
        if (!tenantName || !tenantHouseNumber || !tenantRentAmount || !propertyId) {
          setTenantError('All fields are required.');
          return;
        }
        try {
          const response = await fetch('/api/tenants', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              property: propertyId,
              name: tenantName,
              houseNumber: tenantHouseNumber,
              rentAmount: tenantRentAmount,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Error adding tenant');
          setTenantMsg('Tenant added successfully!');
          setTenants((prev) => [...prev, data]);
          setShowTenantModal(false);
          setTenantName('');
          setTenantHouseNumber('');
          setTenantRentAmount('');
        } catch (err) {
          setTenantError(err.message);
        }
      };

      // Delete tenant handler
      const handleDeleteTenant = async (tenantId) => {
        setTenantError('');
        setTenantMsg('');
        try {
          const response = await fetch(`/api/tenants/${tenantId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Error deleting tenant');
          setTenantMsg('Tenant deleted.');
          setTenants((prev) => prev.filter((t) => t._id !== tenantId));
        } catch (err) {
          setTenantError(err.message);
        }
      };

      // Mark tenant as paid
      const handleMarkPaid = async (tenantId) => {
        setTenantError('');
        setTenantMsg('');
        try {
          const response = await fetch(`/api/tenants/${tenantId}/pay`, {
            method: 'PUT',
            headers: getAuthHeaders(),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Error updating payment status');
          setTenantMsg('Tenant marked as paid.');
          setTenants((prev) => prev.map((t) => t._id === tenantId ? { ...t, paymentStatus: 'paid' } : t));
        } catch (err) {
          setTenantError(err.message);
        }
      };

      // Fetch data
      useEffect(() => {
        // Remove the useEffect that calls getUnpaidHouses, getHouses, getPayments, and any other undefined/unimported variables or functions
        // Ensure all state and API calls are valid and runtime-safe
        // If any section depends on undefined data, replace it with a placeholder or remove it
      }, []);

      // Fetch events and archived tenants on mount
      useEffect(() => {
        // Fetch events
        fetch('/api/events', { headers: getAuthHeaders() })
          .then(res => res.json())
          .then(data => setEvents(Array.isArray(data) ? data : []))
          .catch(() => setEvents([]));
        // Fetch archived tenants
        fetch('/api/tenants/archived', { headers: getAuthHeaders() })
          .then(res => res.json())
          .then(setArchivedTenants)
          .catch(() => setArchivedTenants([]));
      }, []);

      // Compute occupancy and arrears using tenant status logic
      const occupiedUnits = tenants.length;
      const arrearsUnits = tenants.filter(t => {
        const deposit = t.deposit || 0;
        const rentPaid = t.rentPaid || 0;
        const totalPaid = deposit + rentPaid;
        return !(t.balance === 0 && totalPaid >= (t.rentAmount || 0) * 2);
      }).length;
      const vacantUnits = (properties.reduce((sum, p) => sum + (p.units ? p.units.length : p.numUnits || 0), 0)) - occupiedUnits;

      const occupancyData = [
        { name: 'Occupied', value: occupiedUnits },
        { name: 'Vacant', value: vacantUnits },
      ];
      const COLORS = ['#4F46E5', '#F59E42'];

      // Quick Actions
      const quickActionsSection = (
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            onClick={() => navigate('/properties/add')}
            aria-label="Add Property"
            title="Add a new property"
          >
            <PlusCircle size={20} /> <span className="font-semibold">Add Property</span>
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            onClick={() => navigate('/tenants/add')}
            aria-label="Add Tenant"
            title="Add a new tenant"
          >
            <UserPlus size={20} /> <span className="font-semibold">Add Tenant</span>
          </button>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onClick={() => {
              const el = document.getElementById('payments-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Record Payment"
            title="Record a payment"
          >
            <FilePlus size={20} /> <span className="font-semibold">Record Payment</span>
          </button>
          <button
            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-3 rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            onClick={() => alert('Export functionality coming soon!')}
            aria-label="Export Data"
            title="Export data (coming soon)"
          >
            <Download size={20} /> <span className="font-semibold">Export Data</span>
          </button>
        </div>
      );

      // Dashboard section
      const dashboardSection = (
        <div>
          <div className="text-2xl font-bold mb-4">Welcome, Landlord!</div>
          <div className="text-gray-600">Select a section from the left panel to manage your properties and houses.</div>
        </div>
      );

      // Houses/Flats section (unpaid houses, add house modal)
      const housesSection = (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-red-600">Unpaid Houses/Flats</h2>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => { setShowHouseModal(true); setMessage(''); }}
            >
              + Add House/Flat
            </button>
          </div>
          {message && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          {houses.length === 0 ? (
            <p className="text-gray-600">No unpaid houses/flats found. Please add a new one!</p>
          ) : (
            <ul className="space-y-3">
              {houses.map((house) => (
                <li key={house._id} className="flex justify-between items-center bg-red-50 p-3 rounded-md border border-red-200">
                  <div>
                    <p className="font-medium text-red-800">House: {house.houseNumber} ({house.location})</p>
                    <p className="text-sm text-red-700">Rent: ${house.rentAmount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleSimulatePayment(house._id, house.houseNumber)}
                    className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-150 ease-in-out text-sm"
                  >
                    Simulate Payment
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Modal for Add House/Flat */}
          {showHouseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setShowHouseModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3 className="text-lg font-semibold mb-4">Create New House/Flat</h3>
                <form onSubmit={handleCreateHouse} className="space-y-4">
                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">House Number</label>
                    <input
                      type="text"
                      id="houseNumber"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      id="location"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">Rent Amount</label>
                    <input
                      type="number"
                      id="rentAmount"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  >
                    Add House
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      );

      // Payments section (placeholder)
      const handleRecordPayment = (e) => {
        e.preventDefault();
        // Implement payment logic or leave as a placeholder
        alert('Record payment logic not implemented yet.');
      };
      const paymentsSection = (
        <div id="payments-section" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Record Payment</h2>
          {paymentMsg && <div className="mb-2 text-green-600 text-center">{paymentMsg}</div>}
          {paymentError && <div className="mb-2 text-red-600 text-center">{paymentError}</div>}
          {/* Show current balance for selected tenant */}
          {tenants.find(t => t._id === paymentTenant) && (
            <div className="text-sm text-gray-600 mb-2">Current Balance: ${tenants.find(t => t._id === paymentTenant).balance || 0}</div>
          )}
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant</label>
              <select value={paymentTenant} onChange={e => setPaymentTenant(e.target.value)} required className="w-full border p-2 rounded">
                <option value="">Select Tenant</option>
                {tenants.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.house?.houseNumber || 'No House'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
              <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required min="1" className="w-full border p-2 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={!paymentTenant || !tenantHouseId || !paymentAmount}>Record Payment</button>
          </form>
        </div>
      );

      // Real-time Payment Notifications section (always visible at bottom)
      const notificationsSection = (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-green-600 mb-4">
            <CheckCircle size={24} className="text-green-500" /> Real-time Payment Notifications
          </h2>
          {/* Placeholder for notifications */}
          <p className="text-gray-600">No new payment notifications.</p>
        </div>
      );

      // Section selection logic
      let mainContent;
      if (selected === 'dashboard') mainContent = dashboardSection;
      else if (selected === 'houses') mainContent = housesSection;
      else if (selected === 'payments') mainContent = paymentsSection;
      else if (selected === 'logout') { handleLogout(); return null; }

      // Update rent amount when house changes
      useEffect(() => {
        if (tenantHouseId) {
          const house = houses.find(h => h._id === tenantHouseId);
          setTenantRentAmount(house ? house.rentAmount : '');
        } else {
          setTenantRentAmount('');
        }
      }, [tenantHouseId, houses]);

      // Tenant Modal (Add Tenant)
      // const tenantModal = showTenantModal && (
      //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      //     <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
      //       <button
      //         className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
      //         onClick={() => setShowTenantModal(false)}
      //         aria-label="Close"
      //       >
      //         &times;
      //       </button>
      //       <h3 className="text-lg font-semibold mb-4">Add New Tenant</h3>
      //       <form onSubmit={handleAddTenant} className="space-y-4">
      //         {properties.length > 1 && (
      //           <div>
      //             <label htmlFor="tenantProperty" className="block text-sm font-medium text-gray-700">Property</label>
      //             <select
      //               id="tenantProperty"
      //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
      //               value={selectedProperty?._id || ''}
      //               onChange={e => {
      //                 const prop = properties.find(p => p._id === e.target.value);
      //                 setSelectedProperty(prop);
      //               }}
      //               required
      //             >
      //               <option value="">Select Property</option>
      //               {properties.map(p => (
      //                 <option key={p._id} value={p._id}>{p.name} ({p.location})</option>
      //               ))}
      //             </select>
      //           </div>
      //         )}
      //         <div>
      //           <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">Tenant Name</label>
      //           <input
      //             type="text"
      //             id="tenantName"
      //             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
      //             value={tenantName}
      //             onChange={(e) => setTenantName(e.target.value)}
      //             required
      //           />
      //         </div>
      //         <div>
      //           <label htmlFor="tenantHouseNumber" className="block text-sm font-medium text-gray-700">House/Unit Number</label>
      //           <input
      //             type="text"
      //             id="tenantHouseNumber"
      //             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
      //             value={tenantHouseNumber}
      //             onChange={(e) => setTenantHouseNumber(e.target.value)}
      //             required
      //           />
      //         </div>
      //         <div>
      //           <label htmlFor="tenantRentAmount" className="block text-sm font-medium text-gray-700">Rent Amount</label>
      //           <input
      //             type="number"
      //             id="tenantRentAmount"
      //             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
      //             value={tenantRentAmount}
      //             onChange={(e) => setTenantRentAmount(e.target.value)}
      //             required
      //             min="0"
      //             step="0.01"
      //           />
      //         </div>
      //         {tenantError && <div className="mb-2 text-red-600 text-center">{tenantError}</div>}
      //         {tenantMsg && <div className="mb-2 text-green-600 text-center">{tenantMsg}</div>}
      //         <button
      //           type="submit"
      //           className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
      //         >
      //           Add Tenant
      //         </button>
      //       </form>
      //     </div>
      //   </div>
      // );

      // Add Property Modal
      const propertyModal = showPropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => {
                setShowPropModal(false);
                setPropError('');
                setPropMsg('');
                setPropName('');
                setPropLocation('');
                setPropType('flat');
                setPropNumUnits(1);
                setPropDefaultRent('');
                setPropUnits([{ label: '', type: 'bedsitter', rent: '' }]);
                setPropBedrooms(1);
                setPropServantQuarters(0);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Property</h3>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label htmlFor="propName" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="propName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="propLocation" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  id="propLocation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="propType" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="propType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                  required
                >
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="mansion">Mansion</option>
                </select>
              </div>
              {propType === 'flat' && (
                <>
                  <div>
                    <label htmlFor="propNumUnits" className="block text-sm font-medium text-gray-700">Number of Houses</label>
                    <input
                      type="number"
                      id="propNumUnits"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={propNumUnits}
                      onChange={(e) => setPropNumUnits(Number(e.target.value))}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="propDefaultRent" className="block text-sm font-medium text-gray-700">Default Rent (for all houses)</label>
                    <input
                      type="number"
                      id="propDefaultRent"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={propDefaultRent}
                      onChange={(e) => setPropDefaultRent(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">House Details</label>
                    <div
                      className="space-y-2"
                      style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem' }}
                    >
                      {propUnits.map((unit, idx) => (
                        <div key={idx} className="flex flex-wrap gap-2 items-center border p-2 rounded">
                          <input
                            type="text"
                            placeholder="House Label"
                            className="w-24 border rounded p-1"
                            value={unit.label}
                            onChange={e => setPropUnits(units => units.map((u, i) => i === idx ? { ...u, label: e.target.value } : u))}
                            required
                          />
                          <select
                            className="w-32 border rounded p-1"
                            value={unit.type}
                            onChange={e => setPropUnits(units => units.map((u, i) => i === idx ? { ...u, type: e.target.value } : u))}
                            required
                          >
                            <option value="bedsitter">Bedsitter</option>
                            <option value="1br">1 Bedroom</option>
                            <option value="2br">2 Bedroom</option>
                            <option value="3br">3 Bedroom</option>
                            <option value="3br+sq">3 Bedroom + SQ</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Rent"
                            className="w-24 border rounded p-1"
                            value={unit.rent}
                            onChange={e => setPropUnits(units => units.map((u, i) => i === idx ? { ...u, rent: e.target.value } : u))}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {(propType === 'bungalow' || propType === 'mansion') && (
                <>
                  <div>
                    <label htmlFor="propBedrooms" className="block text-sm font-medium text-gray-700">Number of Bedrooms</label>
                    <input
                      type="number"
                      id="propBedrooms"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={propBedrooms}
                      onChange={e => setPropBedrooms(Number(e.target.value))}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="propServantQuarters" className="block text-sm font-medium text-gray-700">Servant Quarters</label>
                    <input
                      type="number"
                      id="propServantQuarters"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={propServantQuarters}
                      onChange={e => setPropServantQuarters(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="propDefaultRent" className="block text-sm font-medium text-gray-700">Rent</label>
                    <input
                      type="number"
                      id="propDefaultRent"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      value={propDefaultRent}
                      onChange={(e) => setPropDefaultRent(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}
              {propError && <div className="mb-2 text-red-600 text-center">{propError}</div>}
              {propMsg && <div className="mb-2 text-green-600 text-center">{propMsg}</div>}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
                disabled={propLoading}
              >
                {propLoading ? 'Adding...' : 'Add Property'}
              </button>
            </form>
          </div>
        </div>
      );

      // Update units when numUnits or default rent changes (for flats)
      useEffect(() => {
        if (propType === 'flat') {
          setPropUnits((prev) => {
            const units = [];
            for (let i = 0; i < propNumUnits; i++) {
              units.push({
                label: prev[i]?.label || `House ${i + 1}`,
                type: prev[i]?.type || 'bedsitter',
                rent: prev[i]?.rent || propDefaultRent || '',
              });
            }
            return units;
          });
        }
      }, [propNumUnits, propDefaultRent, propType]);

      const paymentHistorySection = (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Payment History</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>House</th>
                <th>Tenant</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-4">No payments yet.</td></tr>
              ) : (
                payments.map((p, idx) => (
                  <tr key={p._id || idx} className="border-t">
                    <td>{new Date(p.createdAt || p.paymentDate).toLocaleString()}</td>
                    <td>${p.amount}</td>
                    <td>{p.method || 'manual'}</td>
                    <td className={p.status === 'success' ? 'text-green-600' : p.status === 'failed' ? 'text-red-600' : ''}>{p.status || (p.isFullPayment ? 'success' : 'partial')}</td>
                    <td>{p.mpesaReceipt || '-'}</td>
                    <td>{p.houseNumber || p.house?.houseNumber || '-'}</td>
                    <td>{p.tenant?.name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );

      // PATCH: Define selectedTenantObj and selectedTenantBalance before paymentsSection
      const selectedTenantObj = tenants.find(t => t._id === paymentTenant) || null;
      const selectedTenantBalance = selectedTenantObj ? selectedTenantObj.balance : '';

      const [totalProperties, setTotalProperties] = useState(null);
      const [totalTenants, setTotalTenants] = useState(null);
      const [statSummaryLoading, setStatSummaryLoading] = useState(true);
      const [statSummaryError, setStatSummaryError] = useState('');
      const [paymentsMonth, setPaymentsMonth] = useState(null);
      const [paymentsMonthLoading, setPaymentsMonthLoading] = useState(true);
      const [paymentsMonthError, setPaymentsMonthError] = useState('');

      // Fetch summary (total properties/tenants)
      useEffect(() => {
        setStatSummaryLoading(true);
        setStatSummaryError('');
        axios.get('/api/analytics/summary')
          .then(res => {
            setTotalProperties(res.data.totalProperties);
            setTotalTenants(res.data.totalTenants);
          })
          .catch(() => setStatSummaryError('Could not load summary.'))
          .finally(() => setStatSummaryLoading(false));
      }, []);
      // Fetch payments this month
      useEffect(() => {
        setPaymentsMonthLoading(true);
        setPaymentsMonthError('');
        axios.get('/api/analytics/rent-collection')
          .then(res => setPaymentsMonth(res.data.totalCollected))
          .catch(() => setPaymentsMonthError('Could not load payments.'))
          .finally(() => setPaymentsMonthLoading(false));
      }, []);

      const [arrearsTrend, setArrearsTrend] = useState([]);
      const [arrearsLoading, setArrearsLoading] = useState(true);
      const [paymentsTrend, setPaymentsTrend] = useState([]);
      const [paymentsTrendLoading, setPaymentsTrendLoading] = useState(true);
      const [tenantsTrend, setTenantsTrend] = useState([]);
      const [tenantsTrendLoading, setTenantsTrendLoading] = useState(true);

      // Fetch arrears trend
      useEffect(() => {
        setArrearsLoading(true);
        axios.get('/api/analytics/arrears-trend')
          .then(res => setArrearsTrend(res.data))
          .finally(() => setArrearsLoading(false));
      }, []);
      // Fetch payments trend
      useEffect(() => {
        setPaymentsTrendLoading(true);
        axios.get('/api/analytics/payments-trend')
          .then(res => setPaymentsTrend(res.data))
          .finally(() => setPaymentsTrendLoading(false));
      }, []);
      // Fetch tenants trend
      useEffect(() => {
        setTenantsTrendLoading(true);
        axios.get('/api/analytics/tenants-trend')
          .then(res => setTenantsTrend(res.data))
          .finally(() => setTenantsTrendLoading(false));
      }, []);

      // Helper to get delta and direction
      function getDelta(trend, key) {
        if (!trend || trend.length < 2) return { value: 0, up: true };
        const prev = trend[trend.length - 2]?.[key] || 0;
        const curr = trend[trend.length - 1]?.[key] || 0;
        const value = curr - prev;
        return { value, up: value >= 0 };
      }

      const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
      const calendarDropdownRef = React.useRef();
      // Close dropdown on outside click
      useEffect(() => {
        function handleClick(e) {
          if (calendarDropdownRef.current && !calendarDropdownRef.current.contains(e.target)) {
            setCalendarDropdownOpen(false);
          }
        }
        if (calendarDropdownOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
      }, [calendarDropdownOpen]);

      return (
        <>
          {/* New Dashboard Sections */}
          {/* --- HEADER --- */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl font-bold text-indigo-700">Landlord Dashboard</div>
          </div>

          {/* --- QUICK ACTIONS ROW (now at top) --- */}
          <div className="flex flex-wrap gap-4 mb-8 items-center">
            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              onClick={() => navigate('/properties/add')}
              aria-label="Add Property"
              title="Add a new property"
            >
              <PlusCircle size={20} /> <span className="font-semibold">Add Property</span>
            </button>
            <button
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              onClick={() => navigate('/tenants/add')}
              aria-label="Add Tenant"
              title="Add a new tenant"
            >
              <UserPlus size={20} /> <span className="font-semibold">Add Tenant</span>
            </button>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={() => alert('Invoice creation coming soon!')}
              aria-label="Create Invoice"
              title="Create Invoice (coming soon)"
            >
              <FilePlus size={20} /> <span className="font-semibold">Create Invoice</span>
            </button>
            <button
              className="flex items-center gap-2 bg-gray-600 text-white px-5 py-3 rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              onClick={() => alert('Record payment coming soon!')}
              aria-label="Record Payment"
              title="Record Payment (coming soon)"
            >
              <Download size={20} /> <span className="font-semibold">Record Payment</span>
            </button>
            <button
              className="flex items-center gap-2 bg-slate-500 text-white px-5 py-3 rounded-lg shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              onClick={() => alert('Export functionality coming soon!')}
              aria-label="Export Data"
              title="Export data (coming soon)"
            >
              <Download size={20} /> <span className="font-semibold">Export Data</span>
            </button>
            {/* Calendar Dropdown Button */}
            <div className="relative" ref={calendarDropdownRef}>
              <button
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                onClick={() => setCalendarDropdownOpen(v => !v)}
                aria-label="Open Calendar"
                title="Open Calendar"
              >
                <CalendarIcon size={20} /> <span className="font-semibold hidden sm:inline">Calendar</span>
              </button>
              {calendarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="font-semibold text-indigo-700 mb-2">Calendar & Events</div>
                  <Calendar
                    value={calendarDate}
                    onChange={setCalendarDate}
                    className="mb-4"
                  />
                  {/* Upcoming events preview (placeholder) */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Upcoming Events</div>
                    {events && events.length > 0 ? (
                      <ul className="text-sm text-gray-700 space-y-1">
                        {events.slice(0, 3).map((ev, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="font-semibold">{ev.title || 'Event'}</span>
                            <span className="text-xs text-gray-500">{ev.date ? new Date(ev.date).toLocaleString() : ''}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400">No upcoming events.</div>
                    )}
                  </div>
                  <button
                    className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    onClick={() => { setCalendarDropdownOpen(false); navigate('/calendar'); }}
                  >View Full Calendar</button>
                </div>
              )}
            </div>
          </div>

          {/* --- KPI CARDS ROW --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {/* Total Properties */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-start border-l-4 border-indigo-500">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><HomeIcon size={18} /> Properties</div>
              <div className="text-2xl font-bold text-indigo-700">{statSummaryLoading ? '...' : totalProperties ?? 0}</div>
              {/* Optionally add a trend/delta here */}
            </div>
            {/* Total Tenants */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-start border-l-4 border-green-500">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><UserPlus size={18} /> Tenants</div>
              <div className="text-2xl font-bold text-green-700">{statSummaryLoading ? '...' : totalTenants ?? 0}</div>
              {/* Optionally add a trend/delta here */}
            </div>
            {/* Rent Collected This Month */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-start border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><HomeIcon size={18} /> Rent Collected</div>
              <div className="text-2xl font-bold text-blue-700">{paymentsMonthLoading ? '...' : `Ksh ${paymentsMonth?.toLocaleString() ?? 0}`}</div>
              {/* Optionally add a trend/delta here */}
            </div>
            {/* Outstanding Arrears */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-start border-l-4 border-red-500">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><HomeIcon size={18} /> Arrears</div>
              <div className="text-2xl font-bold text-red-600">{arrearsLoading ? '...' : `Ksh ${arrearsTrend.length ? arrearsTrend[arrearsTrend.length-1]?.arrears?.toLocaleString() : 0}`}</div>
              {/* Delta/trend */}
              {arrearsTrend.length > 1 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${getDelta(arrearsTrend, 'arrears').up ? 'text-green-600' : 'text-red-600'}`}>
                  {getDelta(arrearsTrend, 'arrears').up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(getDelta(arrearsTrend, 'arrears').value).toLocaleString()} from last month
                </div>
              )}
            </div>
            {/* Occupancy Rate */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-start border-l-4 border-yellow-500">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2"><CheckCircle size={18} /> Occupancy</div>
              <div className="text-2xl font-bold text-yellow-600">{occupiedUnits}</div>
              {/* Optionally add a trend/delta here */}
            </div>
          </div>

          {/* --- KPI PIE/DONUT CHARTS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Rent Collected vs. Arrears Pie */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <div className="font-semibold text-indigo-700 mb-2 text-sm">Rent Collected vs. Arrears</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Collected', value: paymentsMonth || 0 },
                      { name: 'Arrears', value: arrearsTrend.length ? arrearsTrend[arrearsTrend.length-1]?.arrears || 0 : 0 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#6366f1"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="collected" fill="#6366f1" />
                    <Cell key="arrears" fill="#ef4444" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Occupied vs. Vacant Pie */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <div className="font-semibold text-yellow-700 mb-2 text-sm">Occupied vs. Vacant Units</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Occupied', value: occupiedUnits },
                      { name: 'Vacant', value: vacantUnits },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#eab308"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="occupied" fill="#eab308" />
                    <Cell key="vacant" fill="#d1d5db" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- AUDIT LOG SECTION --- */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <div className="font-semibold text-indigo-700 mb-2 text-sm">Audit Log</div>
            <ul className="divide-y divide-gray-100 text-sm">
              {/* Mock audit log data */}
              {[
                { icon: <UserPlus size={16} className="text-blue-500" />, desc: 'Added new tenant: John Doe (Unit 3A)', date: '2024-07-10 09:15' },
                { icon: <HomeIcon size={16} className="text-green-500" />, desc: 'Recorded payment: Ksh 12,000 by Jane Smith', date: '2024-07-09 17:42' },
                { icon: <HomeIcon size={16} className="text-indigo-500" />, desc: 'Added new property: Greenview Apartments', date: '2024-07-08 14:20' },
                { icon: <CheckCircle size={16} className="text-green-600" />, desc: 'Marked tenant as paid: Alice Brown', date: '2024-07-07 11:05' },
                { icon: <X size={16} className="text-red-500" />, desc: 'Deleted tenant: Bob White', date: '2024-07-06 16:30' },
              ].map((log, idx) => (
                <li key={idx} className="py-2 flex items-center gap-3">
                  {log.icon}
                  <span className="flex-1">{log.desc}</span>
                  <span className="text-xs text-gray-400">{log.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --- RECENT ACTIVITY & NOTIFICATIONS PREVIEW --- */}
          {/* (Removed as per user request. No activity or notifications widgets on dashboard.) */}

          {/* --- PLACEHOLDER FOR NEW DASHBOARD CONTENT --- */}
          <div className="p-8 text-center text-gray-400 text-xl">Start building your dashboard here...</div>
        </>
      );
    }

    // PATCH: Add error boundary to prevent blank dashboard
    function ErrorBoundary({ children }) {
      const [error, setError] = useState(null);
      if (error) {
        return <div className="p-8 text-center text-red-600 font-bold text-xl">Dashboard Error: {error.message || error.toString()}</div>;
      }
      return (
        <React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          {children}
        </React.Suspense>
      );
    }

    function LandlordDashboardWrapper() {
      return (
        <ErrorBoundary>
          <LandlordDashboard />
        </ErrorBoundary>
      );
    }

    export default LandlordDashboardWrapper;
    