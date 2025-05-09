const cityService = require('../services/cityService');
const ResponseHandler = require('../utils/responseHandler');
const { PLAYER_STATUS } = require('../utils/constants');
const BaseController = require('./baseController');

class CityController extends BaseController {

  constructor() {
    super();
    this.getCities = this.getCities.bind(this);
  }

  async getCities(req, res) {
    try {
      const { search } = req.query;
      const cities = await cityService.getCities(search);
      this.handleSuccess(res, cities, 'Cities retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = CityController; 