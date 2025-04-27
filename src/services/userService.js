const User = require("../models/User");

class UserService {
  async getAllUsersPaginated(search, page, limit, role) {

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const users = await User.find(query, null, options);
    const total = await User.countDocuments(query);

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async getUserById(id, role) {
    const query = { _id: id };
    if (role) {
      query.role = role;
    }
    const user = await User.findOne(query);
    return user;
  }

  async updateUserById(id, data, role) {
    const query = { _id: id };
    if (role) {
      query.role = role;
    }
    const user = await User.findOneAndUpdate(query, data, { new: true });
    return user;
  }

  async deleteUserById(id, role) {
    const query = { _id: id };
    if (role) {
      query.role = role;
    }
    const user = await User.findOneAndDelete(query);
    return user;
  }
}
module.exports = new UserService();
