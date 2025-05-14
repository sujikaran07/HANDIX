import React from 'react';
import { Bar } from 'react-chartjs-2';
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

  // Sample data - replace with actual data from API
  const data = {
    labels: getLastTwelveMonths(),
    datasets: [
      {
        label: 'Products Created',
        data: [12, 19, 8, 15, 7, 14, 18, 10, 13, 9, 17, 22], // Sample data
        backgroundColor: [
          '#3498db', // Blue
          '#27ae60', // Green
          '#0022ff', // Dark Blue
          '#e74c3c', // Red
          '#f39c12', // Orange
          '#9b59b6', // Purple
          '#1abc9c', // Teal
          '#34495e', // Dark Gray
          '#2ecc71', // Light Green
          '#e67e22', // Dark Orange
          '#16a085', // Dark Teal
          '#8e44ad'  // Dark Purple
        ],
        borderRadius: 5,
        hoverBackgroundColor: '#2980b9',
      }
    ],
  };

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

  return (
    <div className="artisan-products-bar-chart">
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ArtisanProductsBarChart;
