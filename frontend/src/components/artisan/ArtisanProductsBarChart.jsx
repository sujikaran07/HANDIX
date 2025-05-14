import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ArtisanProductsBarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  // Get last 12 months for labels
  const getLastTwelveMonths = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    const lastTwelveMonths = [];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastTwelveMonths.push(months[monthIndex]);
    }
    
    return lastTwelveMonths;
  };

  // Function to extract artisan ID from token
  const getArtisanIdFromToken = () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      return decoded.id; // The employee ID is stored as 'id' in the token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsEmpty(false);

        // Get artisan ID from token
        const artisanId = getArtisanIdFromToken();
        
        if (!artisanId) {
          console.error('No artisan ID found in token');
          throw new Error('Authentication error. Please log in again.');
        }
        
        // Store artisanId in localStorage for other components
        localStorage.setItem('artisanId', artisanId);
        
        console.log(`Fetching data for artisan ID: ${artisanId}`);
        
        // Set authorization header with token
        const token = localStorage.getItem('artisanToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set a timeout for requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        );
        
        // Fetch both products and revenue data
        const [productsResponse, revenueResponse] = await Promise.all([
          Promise.race([
            axios.get(`http://localhost:5000/api/artisan-dashboard/products-trend/${artisanId}`),
            timeoutPromise
          ]),
          Promise.race([
            axios.get(`http://localhost:5000/api/artisan-dashboard/revenue-trend/${artisanId}`),
            timeoutPromise
          ])
        ]);
        
        console.log('API responses:', { 
          products: productsResponse.data,
          revenue: revenueResponse.data 
        });
        
        const monthLabels = getLastTwelveMonths();
        const productData = new Array(12).fill(0);
        const revenueData = new Array(12).fill(0);
        
        // Process products data
        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          productsResponse.data.forEach(item => {
            if (item && item.month) {
              const monthDate = new Date(item.month);
              const monthIndex = monthDate.getMonth();
              const currentMonth = new Date().getMonth();
              const position = (monthIndex - currentMonth + 12) % 12;
              if (position >= 0 && position < 12) {
                productData[position] = parseInt(item.count) || 0;
              }
            }
          });
        }
        
        // Process revenue data
        if (revenueResponse.data && Array.isArray(revenueResponse.data)) {
          revenueResponse.data.forEach(item => {
            if (item && item.month) {
              const monthDate = new Date(item.month);
              const monthIndex = monthDate.getMonth();
              const currentMonth = new Date().getMonth();
              const position = (monthIndex - currentMonth + 12) % 12;
              if (position >= 0 && position < 12) {
                revenueData[position] = parseFloat(item.total) || 0;
              }
            }
          });
        }

        // Check if there's any data
        const hasData = productData.some(val => val > 0) || revenueData.some(val => val > 0);
        setIsEmpty(!hasData);
        
        setChartData({
          labels: monthLabels,
          datasets: [
            {
              label: 'Products Created',
              data: productData,
              backgroundColor: '#3498db',
              borderRadius: 5,
              yAxisID: 'y',
            },
            {
              label: 'Revenue (LKR)',
              data: revenueData,
              backgroundColor: '#27ae60',
              borderRadius: 5,
              yAxisID: 'y1',
            }
          ]
        });
        
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error.message || 'Failed to load chart data');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Products and Revenue Trends',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#333'
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Products Count',
          color: '#3498db'
        },
        ticks: {
          precision: 0,
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue (LKR)',
          color: '#27ae60'
        },
        ticks: {
          color: '#666',
          callback: (value) => `${value.toLocaleString()} LKR`
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        ticks: {
          color: '#666'
        },
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return (
      <div className="artisan-products-bar-chart">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artisan-products-bar-chart">
        <div style={{
          color: '#e74c3c',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fdf0ed',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center',
          height: '300px',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <h4 style={{ color: '#c0392b', margin: '0' }}>Error Loading Data</h4>
          <p style={{ margin: '0' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="artisan-products-bar-chart">
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center',
          height: '300px',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <h4 style={{ color: '#666', margin: '0' }}>No Data Available</h4>
          <p style={{ margin: '0', color: '#888' }}>
            There are no products or revenue data for the last 12 months.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-products-bar-chart">
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ArtisanProductsBarChart;
