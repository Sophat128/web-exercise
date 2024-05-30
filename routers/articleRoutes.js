const articleRoutes = require("express").Router();
const articleController = require("../controllers/articleControllers")

articleRoutes.get("/api/articles/search", articleController.filterArticles)
articleRoutes.get("/api/articles", articleController.getAllArticles)
articleRoutes.get("/api/articles/:id", articleController.getArticleById)
articleRoutes.post("/api/articles", articleController.createArticle)
articleRoutes.put("/api/articles/:id", articleController.updateArticle)
articleRoutes.put("/api/articles/:id", articleController.deleteArticle)



module.exports = articleRoutes;