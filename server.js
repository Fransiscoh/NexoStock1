const express = require("express")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware to serve static files from frontend directory
app.use("/frontend", express.static(path.join(__dirname, "frontend")))
app.use(express.static(path.join(__dirname, "public")))

// Serve frontend HTML files directly
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "register.html"))
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"))
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Algo salió mal")
})

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "frontend", "index.html"))
})

app.listen(PORT, () => {
  console.log(`[v0] NexoStock servidor corriendo en puerto ${PORT}`)
})
