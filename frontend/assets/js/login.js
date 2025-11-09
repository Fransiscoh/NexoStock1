// Estado global de autenticación
let currentUser = null

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  checkExistingAuth()
})

// Configurar event listeners
function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Enter key en campos de login
  document.getElementById("loginEmail").addEventListener("keypress", handleEnterKey)
  document.getElementById("loginPassword").addEventListener("keypress", handleEnterKey)
}

// Verificar si ya hay una sesión activa
function checkExistingAuth() {
  const savedUser = localStorage.getItem("user")
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser)
      // Redirigir al dashboard
      window.location.href = "index.html"
    } catch (error) {
      console.error("Error parsing saved user:", error)
      localStorage.removeItem("user")
    }
  }
}

// Manejar tecla Enter
function handleEnterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault()
    document.getElementById("loginForm").dispatchEvent(new Event("submit"))
  }
}

// Manejar login
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value
  const errorDiv = document.getElementById("loginError")
  const submitBtn = e.target.querySelector('button[type="submit"]')

  // Validaciones básicas
  if (!email || !password) {
    showError(errorDiv, "Por favor, completa todos los campos")
    return
  }

  if (!isValidEmail(email)) {
    showError(errorDiv, "Por favor, ingresa un email válido")
    return
  }

  // Mostrar loading
  showLoading(submitBtn)
  errorDiv.classList.remove("show")

  try {
    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Verificar credenciales (demo)
    if (email === "admin@stock.com" && password === "admin123") {
      currentUser = {
        id: "1",
        name: "Administrador",
        email: email,
        role: "admin",
        loginTime: new Date().toISOString(),
      }

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(currentUser))

      // Mostrar notificación de éxito
      showNotification("¡Bienvenido al sistema!", "success")

      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    } else {
      showError(errorDiv, "Credenciales incorrectas. Usa: admin@stock.com / admin123")
    }
  } catch (error) {
    console.error("Error during login:", error)
    showError(errorDiv, "Error de conexión. Inténtalo nuevamente.")
  } finally {
    hideLoading(submitBtn)
  }
}

// Mostrar/ocultar contraseña
function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = input.nextElementSibling
  const icon = button.querySelector("i")

  if (input.type === "password") {
    input.type = "text"
    icon.className = "fas fa-eye-slash"
  } else {
    input.type = "password"
    icon.className = "fas fa-eye"
  }
}

// Mostrar contraseña olvidada
function showForgotPassword() {
  showNotification("Funcionalidad de recuperación de contraseña próximamente", "warning")
}

// Funciones de utilidad
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showLoading(button) {
  const text = button.querySelector(".btn-text")
  const spinner = button.querySelector(".loading-spinner")

  if (text && spinner) {
    text.style.display = "none"
    spinner.style.display = "inline-block"
  }
  button.disabled = true
}

function hideLoading(button) {
  const text = button.querySelector(".btn-text")
  const spinner = button.querySelector(".loading-spinner")

  if (text && spinner) {
    text.style.display = "inline"
    spinner.style.display = "none"
  }
  button.disabled = false
}

function showError(errorDiv, message) {
  errorDiv.textContent = message
  errorDiv.classList.add("show")

  // Auto-hide después de 5 segundos
  setTimeout(() => {
    errorDiv.classList.remove("show")
  }, 5000)
}

function showNotification(message, type = "success") {
  const container = document.getElementById("notifications-container") || createNotificationContainer()

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `

  container.appendChild(notification)

  // Auto-remove después de 4 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 4000)
}

function createNotificationContainer() {
  const container = document.createElement("div")
  container.id = "notifications-container"
  document.body.appendChild(container)
  return container
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle"
    case "error":
      return "fa-exclamation-circle"
    case "warning":
      return "fa-exclamation-triangle"
    default:
      return "fa-info-circle"
  }
}

// Limpiar formulario al cargar la página
window.addEventListener("load", () => {
  document.getElementById("loginForm").reset()
})
