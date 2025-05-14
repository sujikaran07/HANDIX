import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Card, Row, Col } from 'react-bootstrap';

const ProductsTrend = () => {
  const [summary, setSummary] = useState({
    totalProductQuantity: 0,
    assignedOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to extract artisan ID from token
  const getArtisanIdFromToken = () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get artisan ID from token
        const artisanId = getArtisanIdFromToken();
        
        if (!artisanId) {
          throw new Error('Authentication error. Please log in again.');
        }
        
        // Set authorization header with token
        const token = localStorage.getItem('artisanToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get(`http://localhost:5000/api/artisan-dashboard/summary/${artisanId}`);
        console.log('Artisan dashboard summary response:', response.data);
        
        // Explicitly convert the quantity to a number
        const productQuantity = Number(response.data.totalProductQuantity) || 0;
        
        // Make sure we're using the right property and it's a number
        const data = {
          ...response.data,
          totalProductQuantity: productQuantity
        };
        
        setSummary(data);        
        setError(null);
      } catch (error) {
        console.error('Error fetching product summary data:', error);
        setError(error.message || 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading product data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <h5>Error Loading Data</h5>
        <p>{error}</p>
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Force quantity to be a number with || 0 fallback
  const displayQuantity = Number(summary.totalProductQuantity) || 0;

  return (
    <Row className="mt-4">
      <Col md={4} className="mb-4">
        <Card className="h-100 shadow-sm">
          <Card.Body className="text-center">
            <h6 className="text-muted mb-2">Total Products</h6>
            <h2 className="mb-0 text-primary">{displayQuantity}</h2>
            <small className="text-muted">All product items</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-4">
        <Card className="h-100 shadow-sm">
          <Card.Body className="text-center">
            <h6 className="text-muted mb-2">Active Orders</h6>
            <h2 className="mb-0 text-warning">{summary.assignedOrders}</h2>
            <small className="text-muted">In progress</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-4">
        <Card className="h-100 shadow-sm">
          <Card.Body className="text-center">
            <h6 className="text-muted mb-2">Completed Orders</h6>
            <h2 className="mb-0 text-info">{summary.completedOrders}</h2>
            <small className="text-muted">Shipped/Delivered</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductsTrend;
