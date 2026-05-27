const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

// IMPORT ROUTES
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// CONNECT ROUTES
app.use("/api/complaints", complaintRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅"); 
})
.catch((error) => {
    console.log(error);
});

// Test Route
app.get("/", (req, res) => {
    res.send("GreenReport Backend Running 🚀");
});

app.get("/test", (req, res) => {
    res.send("TEST ROUTE WORKING");
});

// Server Port
const PORT = 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});