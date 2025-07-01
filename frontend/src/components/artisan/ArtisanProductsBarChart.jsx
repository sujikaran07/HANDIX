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

// Register required ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Bar chart component displaying monthly product quantity trends for artisans
const ArtisanProductsBarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  // Generate last 12 months labels for the chart
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

  // Extract artisan ID from JWT token
  const getArtisanIdFromToken = () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    // Fetch monthly product quantity data for chart
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsEmpty(false);

        const artisanId = getArtisanIdFromToken();
        
        if (!artisanId) {
          throw new Error('Authentication error. Please log in again.');
        }
        
        // Set authorization header
        const token = localStorage.getItem('artisanToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch product trend data
        const response = await axios.get(
          `http://localhost:5000/api/artisan-dashboard/products-trend/${artisanId}`
        );
        
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          setIsEmpty(true);
          return;
        }
        
        // Process data for chart display
        const labels = response.data.map(item => item.monthLabel || 'Unknown');
        const quantities = response.data.map(item => Number(item.count) || 0);
        
        // Check if there's meaningful data
        const hasData = quantities.some(val => val > 0);
        setIsEmpty(!hasData);
        
        // Configure chart data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Product Quantity',
              data: quantities,
              backgroundColor: '#3498db',
              borderColor: '#2980b9',
              borderWidth: 1,
              borderRadius: 5,
              hoverBackgroundColor: '#2980b9'
            }
          ]
        });
      } catch (error) {
        setError(error.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart configuration options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Product Quantity',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#333'
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            return `Quantity: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color: '#666'
        },
        ticks: {
          color: '#666'
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
          color: '#3498db'
        },
        ticks: {
          precision: 0,
          color: '#666',
          callback: function(value) {
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  // Loading state
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

  // Error state
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

  // Empty data state with sample chart
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
          <h4 style={{ color: '#666', margin: '0' }}>No Product Data</h4>
          <p style={{ margin: '0', color: '#888' }}>
            No products have been created in the last 12 months.
            <br />
            All months will show zero quantity.
          </p>
          
          {/* Display empty chart with proper axis labels */}
          <div style={{ width: '80%', height: '200px', marginTop: '20px' }}>
            <Bar 
              data={{
                labels: getLastTwelveMonths(),
                datasets: [
                  {
                    label: 'Product Quantity',
                    data: Array(12).fill(0),
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 0.5)',
                    borderWidth: 1
                  }
                ]
              }} 
              options={{
                ...options,
                scales: {
                  ...options.scales,
                  y: {
                    ...options.scales.y,
                    max: 10,
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-products-bar-chart">
      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ArtisanProductsBarChart;
