import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployee from "./pages/admin/AdminEmployee";
import AdminCustomer from "./pages/admin/AdminCustomer"; 
import './styles/admin/AdminEmployee.css';
import './styles/admin/AdminDashboard.css';
import './styles/admin/AdminCustomer.css'; 

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
