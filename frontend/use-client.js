'use client';

import React from 'react';

// This is a placeholder component. For a real implementation,
// you would use a library like '@react-google-maps/api'.

interface PropertyMapProps {
    apiKey: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ apiKey }) => {
    return (
        <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Interactive Map Placeholder (API Key Provided: {apiKey ? 'Yes' : 'No'})</p>
        </div>
    );
};

export default PropertyMap;