// backend/utils/locationValidator.js

const Pandit = require('../models/Pandit');

const validateCityAvailability = async (city) => {
  if (!city || city === 'Unknown') {
    return {
      valid: false,
      available: false,
      message: 'Please select a valid city for the puja.',
      availableCities: []
    };
  }
  
  const availablePandits = await Pandit.countDocuments({
    location: { $regex: `^${city}$`, $options: 'i' },
    isAvailable: true
  });
  
  const availableCities = await Pandit.distinct('location');
  const validCities = availableCities.filter(c => c && c.trim().length > 0);
  
  if (availablePandits === 0) {
    return {
      valid: false,
      available: false,
      message: `No pandits available in ${city}. Please select from: ${validCities.join(', ')}`,
      availableCities: validCities,
      requestedCity: city
    };
  }
  
  return {
    valid: true,
    available: true,
    message: `${availablePandits} pandit(s) available in ${city}`,
    availableCount: availablePandits,
    availableCities: validCities
  };
};

module.exports = { validateCityAvailability };