export const sriLankaZones = {
    'Zone A': [
        { district: 'Colombo', postalCodes: ['00100', '01500'], shippingFee: 500 },
        { district: 'Gampaha', postalCodes: ['11000', '11600'], shippingFee: 500 },
        { district: 'Kalutara', postalCodes: ['12000', '12200'], shippingFee: 500 }
    ],
    'Zone B': [
        { district: 'Galle', postalCodes: ['80000', '80800'], shippingFee: 600 },
        { district: 'Matara', postalCodes: ['81000', '81800'], shippingFee: 600 },
        { district: 'Hambantota', postalCodes: ['82000', '82800'], shippingFee: 600 }
    ],
    'Zone C': [
        { district: 'Kandy', postalCodes: ['20000', '20500'], shippingFee: 500 },
        { district: 'Matale', postalCodes: ['21000', '21300'], shippingFee: 500 },
        { district: 'Nuwara Eliya', postalCodes: ['22200', '22300'], shippingFee: 500 }
    ],
    'Zone D': [
        { district: 'Kurunegala', postalCodes: ['60000', '60500'], shippingFee: 600 },
        { district: 'Puttalam', postalCodes: ['61300', '61400'], shippingFee: 600 }
    ],
    'Zone E': [
        { district: 'Jaffna', postalCodes: ['40000', '40900'], shippingFee: 300 },
        { district: 'Kilinochchi', postalCodes: ['43000', '43100'], shippingFee: 300 },
        { district: 'Mannar', postalCodes: ['41000', '41200'], shippingFee: 400 },
        { district: 'Mullaitivu', postalCodes: ['42000', '42100'], shippingFee: 250 },
        { district: 'Vavuniya', postalCodes: ['43000', '43200'], shippingFee: 300 }
    ],
    'Zone F': [
        { district: 'Trincomalee', postalCodes: ['31000', '31200'], shippingFee: 700 },
        { district: 'Batticaloa', postalCodes: ['30000', '30300'], shippingFee: 700 },
        { district: 'Ampara', postalCodes: ['40000', '40300'], shippingFee: 700 }
    ],
    'Zone G': [
        { district: 'Badulla', postalCodes: ['90000', '90500'], shippingFee: 700 },
        { district: 'Monaragala', postalCodes: ['91000', '91300'], shippingFee: 700 }
    ],
    'Zone H': [
        { district: 'Ratnapura', postalCodes: ['70000', '70500'], shippingFee: 650 },
        { district: 'Kegalle', postalCodes: ['71000', '71300'], shippingFee: 650 }
    ],
    'Zone I': [
        { district: 'Anuradhapura', postalCodes: ['50000', '50700'], shippingFee: 600 },
        { district: 'Polonnaruwa', postalCodes: ['51000', '51300'], shippingFee: 600 }
    ]
};

// Flatten districts for easy selection
export const allDistricts = Object.values(sriLankaZones).flat();

// Helper function to get shipping fee by district
export const getShippingFeeByDistrict = (district) => {
    const districtInfo = allDistricts.find(d => d.district === district);
    return districtInfo ? districtInfo.shippingFee : 350; // Default fee if district not found
};

// Get all district names as an array
export const districtNames = allDistricts.map(d => d.district);
