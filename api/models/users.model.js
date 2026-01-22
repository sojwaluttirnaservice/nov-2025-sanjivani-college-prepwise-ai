const User = require("../schemas/User");
const usersModel = {
  createUser: (userData) => {
    return User.create(userData);
  },

  // 🔐 Include password explicitly when needed (login)
  getUserByEmail: (email, withPassword = false) => {
    const query = User.findOne({ email });
    if (withPassword) {
      query.select("+password");
    }
    return query;
  },

  getUserById: (userId) => {
    return User.findById(userId);
  },

  updateUserById: (userId, updates) => {
    return User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
  },

  getUsersByRole: (role) => {
    return User.find({ role });
  },

  Model: User,
};

module.exports = usersModel;
