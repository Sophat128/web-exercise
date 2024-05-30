const fs = require("fs");

const path = "./models/articles.json";

let articleData;
try {
  articleData = fs.readFileSync(path, "utf8");
  articleData = JSON.parse(articleData);
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

// Function to filter articles based on query parameters
function filter(articles, query) {
  return articles.filter((article) => {
    const matchesCreatedBy = query.created_by
      ? article.created_by === query.created_by
      : true;
    const matchesIsPublished =
      query.is_published !== undefined
        ? article.is_published === (query.is_published === "true")
        : true;
    const matchesTitle = query.title
      ? article.title.toLowerCase().includes(query.title.toLowerCase())
      : true;
    const matchesContent = query.contents
      ? article.contents.toLowerCase().includes(query.contents.toLowerCase())
      : true;
    return (
      matchesCreatedBy && matchesIsPublished && matchesTitle && matchesContent
    );
  });
}

function findUserById(userId, res) {
  const user = articleData.find((user) => user.id === userId);
  if (!user) {
    res.status(404).send("User not found");
  } else {
    return res.json(user);
  }
}

const filterArticles = (req, res) => {
  const query = req.query;

  const filteredArticles = filter(articleData, query);

  res.status(200).json({
    message: "Articles fetched successfully",
    data: filteredArticles,
  });
};

const getAllArticles = (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const pageSize = parseInt(req.query.pageSize) || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedArticles = articleData.slice(startIndex, endIndex);

  res.json({
    page,
    pageSize,
    totalPages: Math.ceil(articleData.length / pageSize),
    totalItems: articleData.length,
    articles: paginatedArticles,
  });
};

const getArticleById = (req, res) => {
  const id = parseInt(req.params.id);
  findUserById(id, res);
};

const createArticle = (req, res) => {
  const { title, contents, created_by, is_published } = req.body;

  const newId =
    articleData.length > 0 ? articleData[articleData.length - 1].id + 1 : 1;
  const now = new Date().toISOString();

  console.log("last data: ", articleData[articleData.length - 1]);

  const article = {
    id: newId,
    title: title,
    contents: contents,
    created_by: created_by,
    is_published: is_published,
    created_at: now,
    updated_at: now,
  };
  console.log("Data: ", article);
  // Add the new user data to the existing data array
  let existingData = [];
  existingData = articleData;
  existingData.push(article);

  writeDataToFile(path, existingData, res, article, 201);
};

// PUT endpoint to update user data
const updateArticle = (req, res) => {
  const articleId = parseInt(req.params.id);
  const { title, contents, created_by, is_published } = req.body;

  // Read existing data from the JSON file
  let existingData = [];
  existingData = articleData;

  // Find the user to update
  const articleIndex = articleData.findIndex(
    (article) => article.id === articleId
  );
  if (articleIndex === -1) {
    return res.status(404).send("User not found");
  }

  // Update the user's data
  const updatedArticle = {
    ...existingData[articleIndex],
    title: title !== undefined ? title : existingData[articleIndex].title,
    contents:
      contents !== undefined ? contents : existingData[articleIndex].contents,
    created_by:
      created_by !== undefined
        ? created_by
        : existingData[articleIndex].created_by,
    is_published:
      is_published !== undefined
        ? is_published
        : existingData[articleIndex].is_published,
    created_at: existingData[articleIndex].created_at, // Preserve the original creation date
    updated_at: new Date().toISOString(),
  };
  existingData[articleIndex] = updatedArticle;

  // Write the updated data back to the JSON file
  writeDataToFile(path, existingData, res, updatedArticle, 200);
};

// DELETE endpoint to update user data
const deleteArticle = (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = articleData.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).send("Article not found");
  }
  articleData = articleData.filter((user) => user.id !== userId);
  writeDataToFile(path, articleData, res, "Article deleted successfully", 200);
};

module.exports = {
  filterArticles,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
