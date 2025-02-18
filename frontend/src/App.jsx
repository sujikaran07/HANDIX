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
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/adminemployee" element={<AdminEmployee />} />
          <Route path="/admincustomer" element={<AdminCustomer />} />
          <Route path="/adminorder" element={<AdminOrder />} /> 
          <Route path="/adminproducts" element={<AdminProducts />} />
          <Route path="/admininventory" element={<AdminInventory />} /> 
          <Route path="/adminassignorder" element={<AdminAssignOrder />} />
          <Route path="/adminsettings" element={<AdminSettings />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
