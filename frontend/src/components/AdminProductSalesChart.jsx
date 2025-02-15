import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import '../styles/admin/AdminDashboard.css';

const ProductSalesChart = () => {
  const data = {
    labels: ['Accessories', 'Carry Goods', 'Crafts', 'Clothing', 'Artistry'],
    datasets: [
      {
        data: [4589, 1450, 3245, 2890, 1980],
        backgroundColor: ['#36A2EB', '#FF5733', '#4CAF50', '#FFC107', '#9C27B0'],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, 
      },
    },
    maintainAspectRatio: false, 
  };

  return (
    <div className="product-sales mt-4">
      <h4>Product Sales</h4>
      <div className="product-sales-container">
        <div className="product-categories">
          <ul>
            {data.labels.map((category, index) => (
              <li key={index} style={{ color: data.datasets[0].backgroundColor[index] }}>
                <span
                  style={{
                    backgroundColor: data.datasets[0].backgroundColor[index],
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    marginRight: '5px',
                  }}
                ></span>
                {category}
              </li>
            ))}
          </ul>
        </div>
        <div className="product-pie-chart">
          <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            <Pie data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesChart;
