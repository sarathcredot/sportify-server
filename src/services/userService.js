const User = require("../models/User");

class UserService {
  async getAllUsersPaginated(search, page, limit, role) {
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const options = {
      sort: { createdAt: -1 },
    };

    if (!search) {
      options.skip = (page - 1) * limit;
      options.limit = parseInt(limit);
    } else {
      options.skip = 0; // No pagination if search is provided
      options.limit = 10; // No limit if search is provided
    }

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
    try {
      const query = { _id: id };
      if (role) {
        query.role = role;
      }
      const user = await User.findOne(query);
      return user;
    } catch (error) {
      throw new Error(`${role} not found`);
    }
  }

  async updateUserById(id, data, role) {
    try {
      const query = { _id: id };
      if (role) {
        query.role = role;
      }
      const user = await User.findOneAndUpdate(query, data, { new: true });
      return user;
    } catch (error) {
      throw new Error(`${role} not found`);
    }
  }

  async deleteUserById(id, role) {
    try {
      const query = { _id: id };
      if (role) {
        query.role = role;
      }
      const user = await User.findOneAndDelete(query);
      return user;
    } catch (error) {
      throw new Error(`${role} not found`);
    }
  }

  async toggleStatus(id, isActive) {
    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    return user;
  }

  async updateOrganiserProfile(id, data, role) {

    try {

      const query = { _id: id };
      if (role) {
        query.role = role;
      }


      const user = await User.findOneAndUpdate(query, {

        $set: data

      }, { new: true });

      return user;

    } catch (error) {

      throw new Error(`${role} not found`);

    }
  }
}
module.exports = new UserService();
