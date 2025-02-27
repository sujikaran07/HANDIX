import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployee from "./pages/admin/AdminEmployee";
import AdminCustomer from "./pages/admin/AdminCustomer";
import AdminOrder from "./pages/admin/AdminOrder.jsx"; 
import AdminProducts from "./pages/admin/AdminProducts"; 
import AdminInventory from "./pages/admin/AdminInventory"; 
import AdminAssignOrder from "./pages/admin/AdminAssignOrder"; 
import AdminSettings from "./pages/admin/AdminSettings"; 
import AdminLogout from "./pages/admin/AdminLogout"; 
import ArtisanDashboard from "./pages/artisan/ArtisanDashboard"; 

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div style={{ width: "100vw", height: "100vh", backgroundColor: "#fff" }}></div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employee" element={<AdminEmployee />} />
          <Route path="/admin/customers" element={<AdminCustomer />} />
          <Route path="/admin/orders" element={<AdminOrder />} /> 
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/inventory" element={<AdminInventory />} /> 
          <Route path="/admin/assignorders" element={<AdminAssignOrder />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/logout" element={<AdminLogout />} /> 
          <Route path="/artisan/dashboard" element={<ArtisanDashboard />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
