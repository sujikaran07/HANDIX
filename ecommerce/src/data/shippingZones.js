export const sriLankaZones = {
    'Zone A': [
        { district: 'Colombo', postalCodes: ['00100', '01500'], shippingFee: 3000 },
        { district: 'Gampaha', postalCodes: ['11000', '11600'], shippingFee: 3000 },
        { district: 'Kalutara', postalCodes: ['12000', '12200'], shippingFee: 3000 }
    ],
    'Zone B': [
        { district: 'Galle', postalCodes: ['80000', '80800'], shippingFee: 3000 },
        { district: 'Matara', postalCodes: ['81000', '81800'], shippingFee: 3000 },
        { district: 'Hambantota', postalCodes: ['82000', '82800'], shippingFee: 3000 }
    ],
    'Zone C': [
        { district: 'Kandy', postalCodes: ['20000', '20500'], shippingFee: 3000 },
        { district: 'Matale', postalCodes: ['21000', '21300'], shippingFee: 3000 },
        { district: 'Nuwara Eliya', postalCodes: ['22200', '22300'], shippingFee: 3000 }
    ],
    'Zone D': [
        { district: 'Kurunegala', postalCodes: ['60000', '60500'], shippingFee: 2500 },
        { district: 'Puttalam', postalCodes: ['61300', '61400'], shippingFee: 2500 }
    ],
    'Zone E': [
        { district: 'Jaffna', postalCodes: ['40000', '40900'], shippingFee: 2000 },
        { district: 'Kilinochchi', postalCodes: ['43000', '43100'], shippingFee: 2000 },
        { district: 'Mannar', postalCodes: ['41000', '41200'], shippingFee: 2000 },
        { district: 'Mullaitivu', postalCodes: ['42000', '42100'], shippingFee: 2000 },
        { district: 'Vavuniya', postalCodes: ['43000', '43200'], shippingFee: 2000 }
    ],
    'Zone F': [
        { district: 'Trincomalee', postalCodes: ['31000', '31200'], shippingFee: 2100 },
        { district: 'Batticaloa', postalCodes: ['30000', '30300'], shippingFee: 2100 },
        { district: 'Ampara', postalCodes: ['40000', '40300'], shippingFee: 2100 }
    ],
    'Zone G': [
        { district: 'Badulla', postalCodes: ['90000', '90500'], shippingFee: 2000 },
        { district: 'Monaragala', postalCodes: ['91000', '91300'], shippingFee: 2000 }
    ],
    'Zone H': [
        { district: 'Ratnapura', postalCodes: ['70000', '70500'], shippingFee: 2400 },
        { district: 'Kegalle', postalCodes: ['71000', '71300'], shippingFee: 2400 }
    ],
    'Zone I': [
        { district: 'Anuradhapura', postalCodes: ['50000', '50700'], shippingFee: 2500 },
        { district: 'Polonnaruwa', postalCodes: ['51000', '51300'], shippingFee: 2500 }
    ]
};

// Flatten districts for easy selection
export const allDistricts = Object.values(sriLankaZones).flat();

// Get all district names as an array
export const districtNames = allDistricts.map(d => d.district);

// Export the list of Sri Lanka districts
export const sriLankaDistricts = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya'
];

// Define shipping fees for each district
const districtShippingFees = {
  'Colombo': 3000,
  'Gampaha': 3000,
  'Kalutara': 3000,
  'Kandy': 3000,
  'Matale': 3000,
  'Nuwara Eliya': 3000,
  'Galle': 3000,
  'Matara': 3000,
  'Hambantota': 3000,
  'Jaffna': 2000,
  'Kilinochchi': 2000,
  'Mannar': 2000,
  'Vavuniya': 2000,
  'Mullaitivu': 2000,
  'Batticaloa': 2100,
  'Ampara': 2100,
  'Trincomalee': 2100,
  'Kurunegala': 2500,
  'Puttalam': 2500,
  'Anuradhapura': 2500,
  'Polonnaruwa': 2500,
  'Badulla': 2000,
  'Monaragala': 2000,
  'Ratnapura': 2400,
  'Kegalle': 2400
};

// Function to get shipping fee by district - KEPT only this declaration
export const getShippingFeeByDistrict = (district) => {
  return districtShippingFees[district] || 350; // Default to 350 if district not found
};

// Export the shipping fees object as well
export const shippingFees = districtShippingFees;

// Define shipping zones based on regions
export const shippingZones = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern': ['Galle', 'Matara', 'Hambantota'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva': ['Badulla', 'Monaragala'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle']
};



// Function to get zone by district
export const getZoneByDistrict = (district) => {
  for (const [zone, districts] of Object.entries(shippingZones)) {
    if (districts.includes(district)) {
      return zone;
    }
  }
  return null;
};


// Export delivery time estimates by district
export const deliveryTimeEstimates = {
  'Colombo': '3-5 days',
  'Gampaha': '3-5 days',
  'Kalutara': '3-5 days',
  'Kandy': '3-5 days',
  'Matale': '3-5 days',
  'Nuwara Eliya': '3-5 days',
  'Galle': '2-3 days',
  'Matara': '2-3 days',
  'Hambantota': '2-3 days',
  'Jaffna': '3-5 days',
  'Kilinochchi': '3-5 days',
  'Mannar': '3-5 days',
  'Vavuniya': '3-5 days',
  'Mullaitivu': '3-5 days',
  'Batticaloa': '3-4 days',
  'Ampara': '3-4 days',
  'Trincomalee': '3-4 days',
  'Kurunegala': '2-3 days',
  'Puttalam': '2-3 days',
  'Anuradhapura': '2-3 days',
  'Polonnaruwa': '2-3 days',
  'Badulla': '2-3 days',
  'Monaragala': '2-3 days',
  'Ratnapura': '2-3 days',
  'Kegalle': '2-3 days'
};

// Function to get delivery time estimate for a district
export const getDeliveryTimeEstimate = (district) => {
  return deliveryTimeEstimates[district] || '3-5 days'; // Default estimate
};
