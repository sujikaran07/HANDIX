import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const ArtisanProductSalesChart = () => {
  const data = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        label: 'Number of Creations',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="artisan-product-sales-chart">
      <h3>Most Created Products</h3>
      <div className="artisan-product-sales-container">
        <div className="artisan-product-categories">
          <ul>
            {data.labels.map((label, index) => (
              <li key={index}>
                <span style={{ backgroundColor: data.datasets[0].backgroundColor[index], display: 'inline-block', width: '10px', height: '10px', marginRight: '5px' }}></span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="artisan-product-pie-chart">
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ArtisanProductSalesChart;
