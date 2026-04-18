const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, role, department } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof name !== "undefined") {
      user.name = name;
    }

    if (typeof username !== "undefined") {
      user.username = username;
    }

    if (typeof email !== "undefined") {
      user.email = email;
    }

    if (typeof role !== "undefined") {
      user.role = role;
    }

    if (typeof department !== "undefined") {
      user.department = department;
    }

    await user.save();

    const response = user.toObject();
    delete response.password;

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAssignableUsers = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "manager") {
      query.department = req.user.department;
      query.role = { $in: ["employee", "manager"] };
    }

    const users = await User.find(query)
      .select("_id name username email role department")
      .sort({ name: 1 });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssignableUsers,
};
