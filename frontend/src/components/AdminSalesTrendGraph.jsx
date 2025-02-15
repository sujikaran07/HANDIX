import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import '../styles/admin/AdminDashboard.css';

const SalesTrendGraph = () => {
  const data = {
    labels: ['Mar 01', 'Mar 05', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 25', 'Mar 31'],
    datasets: [
      {
        label: 'Sales This Month',
        data: [1,2,3,2,3,2,3,4,4,3,6,4,6,4], 
        backgroundColor: 'rgba(54, 162, 235, 0.6)', 
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          stepSize: 1, 
          callback: function(value) {
            return value + 'k'; 
          }
        }
      }
    }
  };

  return (
    <div className="sales-trend mt-4">
      <h4>Sales This Month</h4>
      <div className="sales-bar-chart" style={{ position: 'relative', width: '95%', height: '190px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesTrendGraph;
