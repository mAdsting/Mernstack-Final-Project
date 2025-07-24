    // client/src/App.jsx
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import LandlordDashboardWrapper from './pages/LandlordDashboard';
    import HousesPage from './pages/HousesPage';
    import TenantsPage from './pages/TenantsPage';
    import Login from './pages/Login';
    import AdminDashboard from './pages/AdminDashboard';
    import Layout from './components/Layout';
    import PropertiesPage from './pages/PropertiesPage';
    import PropertyDetail from './pages/PropertyDetail';
    import UnitDetail from './pages/UnitDetail';
    import AddProperty from './pages/AddProperty';
    import AddTenant from './pages/AddTenant';
    import Notifications from './pages/Notifications';
    import Analytics from './pages/Analytics';
    import Invoices from './pages/Invoices';
    import InvoiceDetail from './pages/InvoiceDetail';
    import Payments from './pages/Payments';
    import Settings from './pages/Settings';
    // Optionally, create a placeholder Calendar page:
    const Calendar = () => <div className="p-6 text-center text-gray-600 text-xl">Calendar/Events feature coming soon.</div>;
    // Add Support placeholder
    const Support = () => <div className="p-6 text-center text-gray-600 text-xl">Support feature coming soon.</div>;

    function App() {
      return (
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route element={<Layout />}>
              <Route path="/" element={<LandlordDashboardWrapper />} />
              <Route path="/dashboard" element={<LandlordDashboardWrapper />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/add" element={<AddProperty />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/properties/:propertyId/units/:unitId" element={<UnitDetail />} />
              <Route path="/houses" element={<HousesPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/tenants/add" element={<AddTenant />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:tenantId" element={<InvoiceDetail />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              {/* Payments page can be added here */}
            </Route>
          </Routes>
        </Router>
      );
    }

    export default App;
    