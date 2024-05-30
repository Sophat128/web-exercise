const dotenv = require("dotenv");
dotenv.config()

const express = require("express");
const userRoutes = require("./routers/userRoutes");
const morgan = require("morgan");
const articleRoutes = require("./routers/articleRoutes");
const app = express();

app.use(morgan("common"))
app.set("view engine", 'ejs')
app.use(express.json())
app.use("/assets", express.static("public"))
app.use("",userRoutes)
app.use("",articleRoutes)



app.listen(process.env.PORT, ()=> {
  console.log("Server is running on http://localhost");
})