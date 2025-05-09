const City = require('../models/City');

const cityService = {
  async getCities(search) {
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cities = await City.find(query).limit(5);
    return cities;
  }
};

module.exports = cityService;
