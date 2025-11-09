// Estado global de registro
const registrationData = {}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  setupPasswordValidation()
})

// Configurar event listeners
function setupEventListeners() {
  // Register form
  document.getElementById("registerForm").addEventListener("submit", handleRegister)

  // Validación en tiempo real
  document.getElementById("registerPassword").addEventListener("input", validatePasswordStrength)
  document.getElementById("confirmPassword").addEventListener("input", validatePasswordMatch)
  document.getElementById("registerEmail").addEventListener("blur", validateEmail)
  document.getElementById("registerName").addEventListener("input", validateName)

  // Enter key en campos
  const inputs = document.querySelectorAll("input")
  inputs.forEach((input) => {
    input.addEventListener("keypress", handleEnterKey)
  })
}

// Configurar validación de contraseña
function setupPasswordValidation() {
  const passwordInput = document.getElementById("registerPassword")
  const strengthIndicator = document.getElementById("passwordStrength")

  passwordInput.addEventListener("input", () => {
    const strength = calculatePasswordStrength(passwordInput.value)
    updatePasswordStrengthIndicator(strengthIndicator, strength)
  })
}

// Manejar tecla Enter
function handleEnterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault()
    const form = e.target.closest("form")
    if (form) {
      form.dispatchEvent(new Event("submit"))
    }
  }
}

// Manejar registro
async function handleRegister(e) {
  e.preventDefault()

  const name = document.getElementById("registerName").value.trim()
  const email = document.getElementById("registerEmail").value.trim()
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const acceptTerms = document.getElementById("acceptTerms").checked
  const errorDiv = document.getElementById("registerError")
  const submitBtn = e.target.querySelector('button[type="submit"]')

  // Validaciones
  const validationResult = validateRegistrationForm(name, email, password, confirmPassword, acceptTerms)
  if (!validationResult.isValid) {
    showError(errorDiv, validationResult.message)
    return
  }

  // Mostrar loading
  showLoading(submitBtn)
  errorDiv.classList.remove("show")

  try {
    // Simular delay de registro
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Verificar si el email ya existe (simulado)
    if (await emailExists(email)) {
      showError(errorDiv, "Este email ya está registrado. Intenta con otro.")
      return
    }

    // Crear usuario
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: "user",
      registrationDate: new Date().toISOString(),
      isActive: true,
    }

    // Guardar usuario (en producción sería una API)
    localStorage.setItem("user", JSON.stringify(newUser))

    // Mostrar notificación de éxito
    showNotification("¡Cuenta creada exitosamente! Redirigiendo...", "success")

    // Redirigir al dashboard después de un breve delay
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  } catch (error) {
    console.error("Error during registration:", error)
    showError(errorDiv, "Error al crear la cuenta. Inténtalo nuevamente.")
  } finally {
    hideLoading(submitBtn)
  }
}

// Validar formulario de registro
function validateRegistrationForm(name, email, password, confirmPassword, acceptTerms) {
  if (!name || name.length < 2) {
    return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" }
  }

  if (!email || !isValidEmail(email)) {
    return { isValid: false, message: "Por favor, ingresa un email válido" }
  }

  if (!password || password.length < 6) {
    return { isValid: false, message: "La contraseña debe tener al menos 6 caracteres" }
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: "Las contraseñas no coinciden" }
  }

  const passwordStrength = calculatePasswordStrength(password)
  if (passwordStrength < 2) {
    return { isValid: false, message: "La contraseña es muy débil. Usa mayúsculas, números y símbolos" }
  }

  if (!acceptTerms) {
    return { isValid: false, message: "Debes aceptar los términos y condiciones" }
  }

  return { isValid: true }
}

// Validar nombre en tiempo real
function validateName() {
  const nameInput = document.getElementById("registerName")
  const name = nameInput.value.trim()

  if (name.length > 0 && name.length < 2) {
    nameInput.style.borderColor = "var(--error-color)"
  } else if (name.length >= 2) {
    nameInput.style.borderColor = "var(--success-color)"
  } else {
    nameInput.style.borderColor = "var(--border-color)"
  }
}

// Validar email en tiempo real
function validateEmail() {
  const emailInput = document.getElementById("registerEmail")
  const email = emailInput.value.trim()

  if (email.length > 0) {
    if (isValidEmail(email)) {
      emailInput.style.borderColor = "var(--success-color)"
    } else {
      emailInput.style.borderColor = "var(--error-color)"
    }
  } else {
    emailInput.style.borderColor = "var(--border-color)"
  }
}

// Validar fuerza de contraseña
function validatePasswordStrength() {
  const passwordInput = document.getElementById("registerPassword")
  const password = passwordInput.value
  const strength = calculatePasswordStrength(password)

  // Cambiar color del borde según la fuerza
  if (password.length === 0) {
    passwordInput.style.borderColor = "var(--border-color)"
  } else if (strength === 1) {
    passwordInput.style.borderColor = "var(--error-color)"
  } else if (strength === 2) {
    passwordInput.style.borderColor = "var(--warning-color)"
  } else {
    passwordInput.style.borderColor = "var(--success-color)"
  }
}

// Validar coincidencia de contraseñas
function validatePasswordMatch() {
  const passwordInput = document.getElementById("registerPassword")
  const confirmInput = document.getElementById("confirmPassword")

  if (confirmInput.value.length > 0) {
    if (passwordInput.value === confirmInput.value) {
      confirmInput.style.borderColor = "var(--success-color)"
    } else {
      confirmInput.style.borderColor = "var(--error-color)"
    }
  } else {
    confirmInput.style.borderColor = "var(--border-color)"
  }
}

// Calcular fuerza de contraseña
function calculatePasswordStrength(password) {
  let strength = 0

  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  return Math.min(strength, 3)
}

// Actualizar indicador de fuerza de contraseña
function updatePasswordStrengthIndicator(indicator, strength) {
  indicator.className = "password-strength"

  if (strength === 1) {
    indicator.classList.add("weak")
  } else if (strength === 2) {
    indicator.classList.add("medium")
  } else if (strength >= 3) {
    indicator.classList.add("strong")
  }
}

// Verificar si el email ya existe (simulado)
async function emailExists(email) {
  // En producción, esto sería una consulta a la API
  const existingUsers = ["admin@stock.com", "test@example.com"]
  return existingUsers.includes(email.toLowerCase())
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

// Mostrar términos y condiciones
function showTerms() {
  showNotification("Términos y condiciones: Funcionalidad próximamente", "warning")
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

  // Auto-hide después de 6 segundos
  setTimeout(() => {
    errorDiv.classList.remove("show")
  }, 6000)
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
  document.getElementById("registerForm").reset()
})
