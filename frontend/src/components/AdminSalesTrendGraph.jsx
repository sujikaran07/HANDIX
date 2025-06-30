// Sales trend bar graph for admin dashboard
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import '../styles/admin/AdminDashboard.css';
import axios from 'axios';

const SalesTrendGraph = () => {
  // State for chart data
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [{
      label: 'Sales This Month',
      data: [],
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 25,
      maxBarThickness: 30,
    }]
  });

  useEffect(() => {
    // Fetch sales trend data from API
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/sales-trend');
        const data = response.data;
        
        const labels = data.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const values = data.map(item => parseFloat(item.total_amount));

        setSalesData({
          labels: labels,
          datasets: [{
            label: 'Sales This Month',
            data: values,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 25,
            maxBarThickness: 30,
          }]
        });
      } catch (error) {
        console.error('Error fetching sales trend data:', error);
      }
    };

    fetchSalesData();
  }, []);

  // Chart options
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `LKR ${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          callback: function(value) {
            return 'LKR ' + value.toLocaleString();
          },
          font: {
            size: 12,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          padding: 10
        }
      }
    }
  };

  // Render sales trend bar chart
  return (
    <div className="sales-trend mt-4" style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        textAlign: 'center',
        marginBottom: '16px',
        fontSize: '20px',
        fontWeight: 700,
        color: '#2c3e50',
        letterSpacing: '0.5px'
      }}>
        Sales This Month
      </div>
      <div className="sales-bar-chart" style={{ 
        width: '100%',
        height: '350px',
        padding: 0,
        margin: 0,
        marginBottom: '32px'
      }}>
        <Bar data={salesData} options={options} />
      </div>
    </div>
  );
};

export default SalesTrendGraph;
