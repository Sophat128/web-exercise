
const fs = require("fs");

const path = "./models/users.json";

let userData;
try {
  userData = fs.readFileSync(path, "utf8");
  userData = JSON.parse(userData);
} catch (err) {
  console.error("Error reading file:", err);
}

/**
 * Writes data to a JSON file and handles the Express response.
 *
 * @param {string} filePath - The path to the JSON file.
 * @param {object} data - The data to write to the file.
 * @param {object} res - The Express response object.
 */

function writeDataToFile(filePath, data, res, reqData, statusCode) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.status(statusCode).json({
      status: statusCode,
      data: reqData,
    });
  } catch (err) {
    console.error("Error writing file:", err);
    res.status(500).send("Internal Server Error");
  }
}

const getAllUser = (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const pageSize = parseInt(req.query.pageSize) || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = userData.slice(startIndex, endIndex);
  res.json({
    page,
    pageSize,
    totalPages: Math.ceil(userData.length / pageSize),
    totalItems: userData.length,
    users: paginatedUsers,
  });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const user = userData.find((user) => user.id === id);
  if (!user) {
    res.status(404).send("User not found");
  } else {
    return res.json(user);
  }
}

const createNewUser = (req, res) => {
  const { username, password } = req.body;

  const newId = userData.length > 0 ? userData[userData.length - 1].id + 1 : 1;

  console.log("last data: ", userData[userData.length - 1]);

  const user = {
    id: newId,
    username: username,
    password: password,
  };
  console.log("Data: ", user);
  // Add the new user data to the existing data array
  let existingData = [];
  existingData = userData;
  existingData.push(user);

  writeDataToFile(path, existingData, res, user, 201);
};


const updateUser = (req, res) => {
  const userId = parseInt(req.params.id);
  console.log("userId: ", userId);
  const { username, password } = req.body;

  // Read existing data from the JSON file
  let existingData = [];
  existingData = userData;

  // Find the user to update
  const userIndex = userData.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).send("User not found");
  }

  // Update the user's data
  const updatedUser = {
    ...existingData[userIndex],
    username:
      username !== undefined ? username : existingData[userIndex].username,
    password:
      password !== undefined ? password : existingData[userIndex].password,
  };
  existingData[userIndex] = updatedUser;

  // Write the updated data back to the JSON file
  writeDataToFile(path, existingData, res, updatedUser, 200);
};

const deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = userData.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).send("User not found");
  }
  userData = userData.filter((user) => user.id !== userId);
  writeDataToFile(
    path,
    userData,
    res,
    "User deleted successfully",
    200
  );
}

module.exports = {
  getAllUser,
  getUserById,
  createNewUser,
  updateUser,
  deleteUser
};
