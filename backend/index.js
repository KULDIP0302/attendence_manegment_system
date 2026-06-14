const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

const app = express()
const Routes = require("./routes/route.js")

const PORT = process.env.PORT || 5000

dotenv.config();

app.use(express.json({ limit: '10mb' }))

// ✅ FIXED CORS
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// ✅ FIXED MONGODB CONNECTION
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server started at port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MongoDB connection failed:", err);
    });

// Routes
app.use('/', Routes);