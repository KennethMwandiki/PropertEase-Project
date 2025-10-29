const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const axios = require('axios');

const secretManagerClient = new SecretManagerServiceClient();

async function getGoogleMapsApiKey() {
  // Assumes a secret named 'google-maps-api-key' with the key value.
  const [version] = await secretManagerClient.accessSecretVersion({
    name: 'projects/your-gcp-project-id/secrets/google-maps-api-key/versions/latest',
  });
  return version.payload.data.toString();
}

exports.geocodeAddress = async (req, res) => {
  // Set CORS headers for preflight requests
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const address = req.body.address;
  if (!address) {
    return res.status(400).send('Address is required.');
  }

  try {
    const apiKey = await getGoogleMapsApiKey();
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Geocoding failed:', error);
    res.status(500).send('Internal Server Error');
  }
};