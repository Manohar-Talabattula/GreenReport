const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: "*"
  })
);

// Body parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

// Routes
app.use("/api/complaints", complaintRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("GreenReport Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connects
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error ❌");
    console.error(error);
    process.exit(1);
  });