
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    const users = await prisma.user.findMany({
      skip: skip,
      take: take,
    });

    const totalItems = await prisma.user.count();
    res.json({
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems: totalItems,
      users: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.json(user);
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

const createNewUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    });
    res.status(201).json({
      status: 201,
      data: user,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send("Internal Server Error");
  }
};

const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username !== undefined ? username : user.username,
        password: password !== undefined ? password : user.password,
      },
    });

    res.status(200).json({
      status: 200,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the user is referenced in any articles
    const articles = await prisma.article.findMany({
      where: { createdById: userId },
    });

    if (articles.length > 0) {
      return res.status(400).send("Cannot delete user because they are referenced in one or more articles");
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).send("User deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  getAllUser,
  getUserById,
  createNewUser,
  updateUser,
  deleteUser,
};
