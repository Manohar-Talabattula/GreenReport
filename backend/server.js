const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");

const complaintRoutes =
  require("./routes/complaintRoutes");

dotenv.config();

const app = express();


// CORS FIX

app.use(

  cors({

    origin: "*"

  })

);


// BODY PARSER

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ROUTES

app.use(
  "/api/complaints",
  complaintRoutes
);


// TEST ROUTE

app.get("/", (req, res) => {

  res.send(
    "GreenReport Backend Running 🚀"
  );

});


// MONGODB CONNECTION

mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

  console.log(
    "MongoDB Connected ✅"
  );

})

.catch((error) => {

  console.log(error);

});


// PORT

const PORT =
  process.env.PORT || 5000;


// START SERVER

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});