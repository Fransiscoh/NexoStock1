const express = require("express")
const path = require("path")

const app = express()

// Middleware
app.use(express.static(path.join(__dirname, "../frontend")))

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/register.html"))
})

// Fallback to index for any other route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Error handling
app.use((err, req, res, next) => {
  console.error("[v0] Error:", err.message)
  res.status(500).json({ error: "Internal Server Error" })
})

module.exports = app
