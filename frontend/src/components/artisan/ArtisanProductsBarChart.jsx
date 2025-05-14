import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
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

  useEffect(() => {
    const fetchProductsTrend = async () => {
      try {
        setLoading(true);
        const artisanId = localStorage.getItem('artisanId') || '1'; // Default to 1 for testing
        console.log(`Fetching products trend for artisan ID: ${artisanId}`);
        
        // Set a timeout to prevent infinite loading if the request fails
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = axios.get(`http://localhost:5000/api/artisan-dashboard/products-trend/${artisanId}`);
        
        // Race between the fetch and the timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Products trend API response:', response.data);
        
        // Process the data
        if (response.data && Array.isArray(response.data)) {
          const monthLabels = getLastTwelveMonths();
          const monthData = new Array(12).fill(0);
          
          response.data.forEach(item => {
            const monthDate = new Date(item.month);
            const monthIndex = monthDate.getMonth();
            const currentMonth = new Date().getMonth();
            const position = (monthIndex - currentMonth + 12) % 12;
            if (position >= 0 && position < 12) {
              monthData[position] = parseInt(item.count);
            }
          });
          
          setChartData({
            labels: monthLabels,
            datasets: [
              {
                label: 'Products Created',
                data: monthData,
                backgroundColor: [
                  '#3498db', '#27ae60', '#0022ff', '#e74c3c',
                  '#f39c12', '#9b59b6', '#1abc9c', '#34495e',
                  '#2ecc71', '#e67e22', '#16a085', '#8e44ad'
                ],
                borderRadius: 5,
                hoverBackgroundColor: '#2980b9',
              }
            ]
          });
        } else {
          throw new Error('Invalid data format from API');
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching products trend:', error);
        setError('Failed to load chart data');
        
        // Fall back to default data
        setChartData({
          labels: getLastTwelveMonths(),
          datasets: [
            {
              label: 'Products Created',
              data: [12, 19, 8, 15, 7, 14, 18, 10, 13, 9, 17, 22], // Sample data
              backgroundColor: [
                '#3498db', '#27ae60', '#0022ff', '#e74c3c',
                '#f39c12', '#9b59b6', '#1abc9c', '#34495e',
                '#2ecc71', '#e67e22', '#16a085', '#8e44ad'
              ],
              borderRadius: 5,
              hoverBackgroundColor: '#2980b9',
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductsTrend();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Products Created per Month',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#333'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          Loading chart data...
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-products-bar-chart">
      {error && <div className="chart-error-message" style={{color: '#e74c3c', padding: '10px', textAlign: 'center'}}>{error} - Showing sample data</div>}
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ArtisanProductsBarChart;
