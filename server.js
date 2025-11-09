const express = require("express")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "frontend")))

// Route handlers for specific pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "register.html"))
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"))
})

// Error handling
app.use((err, req, res, next) => {
  console.error("[v0] Error:", err.stack)
  res.status(500).send("Algo salió mal")
})

app.listen(PORT, () => {
  console.log(`[v0] NexoStock servidor corriendo en puerto ${PORT}`)
})
