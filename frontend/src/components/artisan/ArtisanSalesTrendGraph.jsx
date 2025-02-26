import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const ArtisanSalesTrendGraph = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Products Made',
        data: [65, 59, 80, 81, 56, 55, 40, 70, 60, 75, 85, 90],
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Products Made',
        },
      },
    },
  };

  return (
    <div className="artisan-sales-trend-graph">
      <h3>Products Made vs Month</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ArtisanSalesTrendGraph;
