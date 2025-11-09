// Estado global de la aplicación
let currentUser = null

// Configuración de unidades por tipo de medida
const measurementTypes = {
  weight: [
    { value: "kg", label: "Kilogramo (kg)", baseUnit: "kg", factor: 1 },
    { value: "gramo", label: "Gramo (g)", baseUnit: "kg", factor: 0.001 },
  ],
  volume: [
    { value: "litro", label: "Litro (L)", baseUnit: "litro", factor: 1 },
    { value: "ml", label: "Mililitro (ml)", baseUnit: "litro", factor: 0.001 },
  ],
  length: [
    { value: "metro", label: "Metro (m)", baseUnit: "metro", factor: 1 },
    { value: "cm", label: "Centímetro (cm)", baseUnit: "metro", factor: 0.01 },
  ],
  quantity: [{ value: "unidad", label: "Unidad", baseUnit: "unidad", factor: 1 }],
}

// Datos de la aplicación
let products = [
  {
    id: "1",
    name: "Arroz Blanco",
    code: "ARR001",
    brand: "La Preferida",
    stock: 150,
    minStock: 20,
    purchasePrice: 1.8,
    sellingPrice: 2.34,
    unit: "kg",
    measurementType: "weight",
    category: "Granos",
    isFractioned: false,
    priceHistory: [{ date: new Date().toISOString(), purchasePrice: 1.8, sellingPrice: 2.34 }],
  },
  {
    id: "2",
    name: "Aceite Girasol",
    code: "ACE001",
    brand: "Natura",
    stock: 80,
    minStock: 15,
    purchasePrice: 2.5,
    sellingPrice: 3.25,
    unit: "litro",
    measurementType: "volume",
    category: "Aceites",
    isFractioned: false,
    priceHistory: [{ date: new Date().toISOString(), purchasePrice: 2.5, sellingPrice: 3.25 }],
  },
  {
    id: "3",
    name: "Azúcar Blanca",
    code: "AZU001",
    brand: "Ledesma",
    stock: 200,
    minStock: 30,
    purchasePrice: 1.2,
    sellingPrice: 1.56,
    unit: "kg",
    measurementType: "weight",
    category: "Endulzantes",
    isFractioned: false,
    priceHistory: [{ date: new Date().toISOString(), purchasePrice: 1.2, sellingPrice: 1.56 }],
  },
  {
    id: "4",
    name: "Harina de Trigo",
    code: "HAR001",
    brand: "Morixe",
    stock: 5,
    minStock: 25,
    purchasePrice: 1.0,
    sellingPrice: 1.3,
    unit: "kg",
    measurementType: "weight",
    category: "Harinas",
    isFractioned: false,
    priceHistory: [{ date: new Date().toISOString(), purchasePrice: 1.0, sellingPrice: 1.3 }],
  },
]

let brands = ["La Preferida", "Natura", "Ledesma", "Morixe", "Arcor", "Marolio", "Sancor"]
let categories = ["Granos", "Aceites", "Endulzantes", "Harinas", "Lácteos", "Conservas", "Bebidas"]

let invoiceItems = []
let mixItems = []
let sales = []
let dailyCashClosure = null

let currentTheme = "light"

// Providers management system
let providers = []
let closureHistory = []

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadTheme()
  loadData()
  setupEventListeners()
  checkAuth()
})

// Verificar autenticación
function checkAuth() {
  const savedUser = localStorage.getItem("user")
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser)
      showMainApp()
    } catch (error) {
      console.error("Error parsing user data:", error)
      redirectToLogin()
    }
  } else {
    redirectToLogin()
  }
}

// Redirigir al login
function redirectToLogin() {
  window.location.href = "login.html"
}

// Configurar event listeners
function setupEventListeners() {
  // Add product form
  const addProductForm = document.getElementById("addProductForm")
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProduct)
  }

  const addProviderForm = document.getElementById("addProviderForm")
  if (addProviderForm) {
    addProviderForm.addEventListener("submit", handleAddProvider)
  }
}

// Mostrar aplicación principal
function showMainApp() {
  // Actualizar nombre de usuario
  const userNameElement = document.getElementById("userName")
  const headerUserNameElement = document.getElementById("headerUserName")

  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name
  }
  if (headerUserNameElement && currentUser) {
    headerUserNameElement.textContent = currentUser.name
  }

  // Cargar datos
  updateDashboard()
  loadProductsTable()
  loadAvailableProducts()
  loadMixProducts()
  loadFractionProducts()
  loadBrandsAndCategories()
  loadSalesData()

  loadProviders()
  loadClosureHistory()
}

// Cerrar sesión
function logout() {
  currentUser = null
  localStorage.removeItem("user")
  showNotification("Sesión cerrada correctamente", "success")

  // Redirigir al login después de un breve delay
  setTimeout(() => {
    window.location.href = "login.html"
  }, 1000)
}

// Funciones de tema
function loadTheme() {
  currentTheme = "dark"
  applyTheme()
}

function applyTheme() {
  document.body.setAttribute("data-theme", currentTheme)
}

// Funciones de productos
function updateDashboard() {
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length

  // Calcular ventas del día
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => new Date(sale.date).toDateString() === today)
  const salesToday = todaySales.reduce((total, sale) => total + sale.total, 0)
  const profitToday = todaySales.reduce((total, sale) => total + sale.profit, 0)

  const totalProductsElement = document.getElementById("totalProducts")
  const lowStockElement = document.getElementById("lowStock")
  const salesTodayElement = document.getElementById("salesToday")
  const profitTodayElement = document.getElementById("profitToday")

  if (totalProductsElement) totalProductsElement.textContent = totalProducts
  if (lowStockElement) lowStockElement.textContent = lowStockProducts
  if (salesTodayElement) salesTodayElement.textContent = `$${salesToday.toFixed(2)}`
  if (profitTodayElement) profitTodayElement.textContent = `$${profitToday.toFixed(2)}`
}

function loadProductsTable() {
  const tbody = document.getElementById("productsTableBody")
  if (!tbody) return

  tbody.innerHTML = ""

  products.forEach((product) => {
    const row = createProductRow(product)
    tbody.appendChild(row)
  })
}

function createProductRow(product) {
  const row = document.createElement("tr")
  if (product.isFractioned) {
    row.classList.add("fractioned")
  }

  const margin = calculateProfitMargin(product.purchasePrice, product.sellingPrice)
  const stockStatus = getStockStatus(product)

  // Verificar si el producto ha sido vendido para mostrar información adicional
  const hasBeenSold = sales.some((sale) => sale.items.some((item) => item.productId === product.id))
  const salesStats = hasBeenSold ? getProductSalesStats(product.id) : null

  row.innerHTML = `
        <td>
            <span class="font-mono">${product.code}</span>
            ${product.isFractioned ? '<span class="badge badge-info">Fraccionado</span>' : ""}
            ${hasBeenSold ? '<span class="badge badge-warning" title="Producto vendido anteriormente">Vendido</span>' : ""}
        </td>
        <td>
            <strong>${product.name}</strong>
            ${product.isFractioned ? `<br><small>Fracción del producto original</small>` : ""}
            ${salesStats ? `<br><small style="color: var(--success-color);">Vendido: ${salesStats.totalQuantitySold} ${product.unit} | $${salesStats.totalRevenue.toFixed(2)}</small>` : ""}
        </td>
        <td>${product.brand || "Sin marca"}</td>
        <td>${product.category}</td>
        <td>
            <span class="${product.stock <= product.minStock ? "text-red" : ""}">
                ${product.stock} ${product.unit}
                ${product.stock <= product.minStock ? `<br><small>Min: ${product.minStock}</small>` : ""}
            </span>
        </td>
        <td>
            <input type="number" value="${product.purchasePrice}" 
                   onchange="updateProductPrice('${product.id}', 'purchase', this.value)"
                   class="quantity-input" step="0.01" min="0">
        </td>
        <td>
            <input type="number" value="${product.sellingPrice}" 
                   class="quantity-input" step="0.01" min="0" readonly
                   title="Precio automático (30% sobre costo)">
        </td>
        <td>
            <span class="text-green">30.0%</span>
        </td>
        <td>
            <span class="badge ${stockStatus.class}">${stockStatus.text}</span>
        </td>
        <td>
            <button class="btn-sm" onclick="updateStock('${product.id}', 1)" title="Aumentar stock">
                <i class="fas fa-plus"></i>
            </button>
            <button class="btn-sm" onclick="updateStock('${product.id}', -1)" 
                    ${product.stock <= 0 ? "disabled" : ""} title="Reducir stock">
                <i class="fas fa-minus"></i>
            </button>
            <button class="btn-sm" onclick="confirmDeleteProduct('${product.id}')" 
                    style="background: var(--error-color); color: white; border-color: var(--error-color);" 
                    title="Eliminar producto">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `

  return row
}

function calculateProfitMargin(purchasePrice, sellingPrice) {
  if (purchasePrice === 0) return 0
  return ((sellingPrice - purchasePrice) / purchasePrice) * 100
}

function getStockStatus(product) {
  if (product.stock <= product.minStock) {
    return { class: "badge-danger", text: "Stock Bajo" }
  } else if (product.stock <= product.minStock * 2) {
    return { class: "badge-warning", text: "Stock Medio" }
  } else {
    return { class: "badge-success", text: "Stock OK" }
  }
}

// Funciones de proveedores
function handleAddProvider(e) {
  e.preventDefault()

  const name = document.getElementById("providerName").value.trim()
  const contact = document.getElementById("providerContact").value.trim()
  const email = document.getElementById("providerEmail").value.trim()
  const phone = document.getElementById("providerPhone").value.trim()
  const address = document.getElementById("providerAddress").value.trim()

  if (!name || !contact || !email || !phone || !address) {
    showNotification("Por favor completa todos los campos", "warning")
    return
  }

  const newProvider = {
    id: Date.now().toString(),
    name,
    contact,
    email,
    phone,
    address,
    createdAt: new Date().toISOString(),
  }

  providers.push(newProvider)

  document.getElementById("addProviderForm").reset()
  loadProviders()
  saveData()

  showNotification(`Proveedor "${name}" agregado exitosamente`, "success")
}

function loadProviders() {
  const container = document.getElementById("providersList")
  if (!container) return

  if (providers.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay proveedores registrados</p>'
    return
  }

  container.innerHTML = ""

  providers.forEach((provider) => {
    const card = document.createElement("div")
    card.className = "provider-card"
    card.innerHTML = `
      <div class="provider-header">
        <div>
          <div class="provider-name">${provider.name}</div>
          <div class="provider-contact-name">Contacto: ${provider.contact}</div>
        </div>
        <button class="btn-sm" onclick="deleteProvider('${provider.id}')" 
                style="background: var(--error-color); color: white; border-color: var(--error-color);">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="provider-details">
        <div class="provider-detail">
          <i class="fas fa-envelope"></i>
          <span>${provider.email}</span>
        </div>
        <div class="provider-detail">
          <i class="fas fa-phone"></i>
          <span>${provider.phone}</span>
        </div>
        <div class="provider-detail" style="grid-column: 1 / -1;">
          <i class="fas fa-map-marker-alt"></i>
          <span>${provider.address}</span>
        </div>
      </div>
    `
    container.appendChild(card)
  })
}

function deleteProvider(providerId) {
  const provider = providers.find((p) => p.id === providerId)
  if (!provider) return

  if (confirm(`¿Estás seguro de que deseas eliminar el proveedor "${provider.name}"?`)) {
    providers = providers.filter((p) => p.id !== providerId)
    loadProviders()
    saveData()
    showNotification(`Proveedor "${provider.name}" eliminado`, "success")
  }
}

// Funciones de cierre de caja
function closeCashRegister() {
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => new Date(sale.date).toDateString() === today)

  if (todaySales.length === 0) {
    showNotification("No hay ventas para cerrar", "warning")
    return
  }

  const totalSales = todaySales.reduce((total, sale) => total + sale.total, 0)
  const totalCosts = todaySales.reduce((total, sale) => total + sale.cost, 0)
  const totalProfit = todaySales.reduce((total, sale) => total + sale.profit, 0)

  const productsSummary = calculateDailyProductsSummary()

  const closure = {
    id: Date.now().toString(),
    date: today,
    fullDate: new Date().toISOString(),
    sales: totalSales,
    costs: totalCosts,
    profit: totalProfit,
    transactions: todaySales.length,
    productsSummary: productsSummary,
    totalItemsSold: Object.values(productsSummary).reduce((sum, p) => sum + p.quantity, 0),
    closedBy: currentUser.name,
    closedAt: new Date().toISOString(),
  }

  closureHistory.push(closure)
  dailyCashClosure = closure
  saveData()

  showNotification(`Caja cerrada. Total: $${totalSales.toFixed(2)} | Ganancia: $${totalProfit.toFixed(2)}`, "success")
  showCashClosureModal(closure)
}

function showCashClosureModal(closure) {
  const modal = document.createElement("div")
  modal.className = "modal-overlay"

  const productsHtml = Object.entries(closure.productsSummary)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .map(
      ([name, data]) => `
      <div class="closure-product-row">
        <div class="closure-product-info">
          <div class="closure-product-name">${name}</div>
          <div class="closure-product-details">
            Ingresos: $${data.totalRevenue.toFixed(2)} | Ganancia: $${data.totalProfit.toFixed(2)}
          </div>
        </div>
        <div class="closure-product-qty">${data.quantity} ${data.unit}</div>
      </div>
    `,
    )
    .join("")

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-cash-register"></i> Cierre de Caja Completado</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="closure-date">${new Date(closure.fullDate).toLocaleDateString()}</div>
        
        <div class="closure-stats">
          <div class="closure-stat">
            <div class="closure-stat-label">Ventas Totales</div>
            <div class="closure-stat-value">$${closure.sales.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Costo</div>
            <div class="closure-stat-value">$${closure.costs.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Ganancia Neta</div>
            <div class="closure-stat-value success">$${closure.profit.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Transacciones</div>
            <div class="closure-stat-value">${closure.transactions}</div>
          </div>
        </div>

        <div class="closure-products">
          <div class="closure-products-title">
            <i class="fas fa-box"></i> Productos Vendidos (${closure.totalItemsSold} items)
          </div>
          <div class="closure-products-list">
            ${productsHtml}
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-muted);">
          <strong>Cerrado por:</strong> ${closure.closedBy}<br>
          <strong>Fecha y Hora:</strong> ${new Date(closure.closedAt).toLocaleString()}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" onclick="closeModal()">Cerrar</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

function closeModal() {
  const modal = document.querySelector(".modal-overlay")
  if (modal) {
    modal.remove()
  }
}

function loadClosureHistory() {
  const container = document.getElementById("closureHistoryList")
  if (!container) return

  if (closureHistory.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay cierres de caja registrados</p>'
    return
  }

  container.innerHTML = ""

  const sortedClosures = [...closureHistory].sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate))

  sortedClosures.forEach((closure) => {
    const item = createClosureHistoryItem(closure)
    container.appendChild(item)
  })
}

function createClosureHistoryItem(closure) {
  const item = document.createElement("div")
  item.className = "closure-item"

  const productsHtml = Object.entries(closure.productsSummary)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .map(
      ([name, data]) => `
      <div class="closure-product-row">
        <div class="closure-product-info">
          <div class="closure-product-name">${name}</div>
          <div class="closure-product-details">
            $${data.totalRevenue.toFixed(2)} ingresos | $${data.totalProfit.toFixed(2)} ganancia
          </div>
        </div>
        <div class="closure-product-qty">${data.quantity} ${data.unit}</div>
      </div>
    `,
    )
    .join("")

  item.innerHTML = `
    <div class="closure-date">
      <i class="fas fa-calendar-alt"></i> ${new Date(closure.fullDate).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
    </div>

    <div class="closure-stats">
      <div class="closure-stat">
        <div class="closure-stat-label">Ventas</div>
        <div class="closure-stat-value">$${closure.sales.toFixed(2)}</div>
      </div>
      <div class="closure-stat">
        <div class="closure-stat-label">Costo</div>
        <div class="closure-stat-value">$${closure.costs.toFixed(2)}</div>
      </div>
      <div class="closure-stat">
        <div class="closure-stat-label">Ganancia</div>
        <div class="closure-stat-value success">$${closure.profit.toFixed(2)}</div>
      </div>
      <div class="closure-stat">
        <div class="closure-stat-label">Transacciones</div>
        <div class="closure-stat-value">${closure.transactions}</div>
      </div>
    </div>

    <div class="closure-products">
      <div class="closure-products-title">
        <i class="fas fa-box"></i> Productos Vendidos (${closure.totalItemsSold} items)
      </div>
      <div class="closure-products-list">
        ${productsHtml}
      </div>
    </div>

    <div class="closure-actions">
      <button class="btn-sm" onclick="viewClosureDetail('${closure.id}')" style="background: var(--accent-color); color: white; border-color: var(--accent-color);">
        <i class="fas fa-eye"></i> Ver Detalles
      </button>
      <button class="btn-sm" onclick="deleteClosureRecord('${closure.id}')" style="background: var(--error-color); color: white; border-color: var(--error-color);">
        <i class="fas fa-trash"></i> Eliminar
      </button>
    </div>
  `

  return item
}

function viewClosureDetail(closureId) {
  const closure = closureHistory.find((c) => c.id === closureId)
  if (!closure) return

  const modal = document.createElement("div")
  modal.className = "modal-overlay"

  const productsHtml = Object.entries(closure.productsSummary)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .map(
      ([name, data]) => `
      <div class="closure-product-row">
        <div class="closure-product-info">
          <div class="closure-product-name">${name}</div>
          <div class="closure-product-details">
            Ingresos: $${data.totalRevenue.toFixed(2)} | Ganancia: $${data.totalProfit.toFixed(2)}
          </div>
        </div>
        <div class="closure-product-qty">${data.quantity} ${data.unit}</div>
      </div>
    `,
    )
    .join("")

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-receipt"></i> Detalle del Cierre de Caja</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="closure-date">${new Date(closure.fullDate).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</div>
        
        <div class="closure-stats">
          <div class="closure-stat">
            <div class="closure-stat-label">Ventas Totales</div>
            <div class="closure-stat-value">$${closure.sales.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Costo Total</div>
            <div class="closure-stat-value">$${closure.costs.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Ganancia Neta</div>
            <div class="closure-stat-value success">$${closure.profit.toFixed(2)}</div>
          </div>
          <div class="closure-stat">
            <div class="closure-stat-label">Transacciones</div>
            <div class="closure-stat-value">${closure.transactions}</div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--surface-color); border-radius: 8px;">
          <strong>Margen de Ganancia:</strong> ${((closure.profit / closure.sales) * 100).toFixed(2)}%<br>
          <strong>Ticket Promedio:</strong> $${(closure.sales / closure.transactions).toFixed(2)}<br>
          <strong>Items Vendidos:</strong> ${closure.totalItemsSold} items
        </div>

        <div class="closure-products">
          <div class="closure-products-title">
            <i class="fas fa-box"></i> Productos Vendidos
          </div>
          <div class="closure-products-list">
            ${productsHtml}
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-muted);">
          <strong>Información del Cierre:</strong><br>
          Cerrado por: ${closure.closedBy}<br>
          Fecha y Hora: ${new Date(closure.closedAt).toLocaleString()}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" onclick="closeModal()">Cerrar</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

function deleteClosureRecord(closureId) {
  const closure = closureHistory.find((c) => c.id === closureId)
  if (!closure) return

  if (
    confirm(`¿Estás seguro de que deseas eliminar el cierre del ${new Date(closure.fullDate).toLocaleDateString()}?`)
  ) {
    closureHistory = closureHistory.filter((c) => c.id !== closureId)
    loadClosureHistory()
    saveData()
    showNotification("Cierre de caja eliminado", "success")
  }
}

function filterClosures() {
  const searchTerm = document.getElementById("searchClosures")?.value.toLowerCase() || ""
  const items = document.querySelectorAll(".closure-item")

  items.forEach((item) => {
    const text = item.textContent.toLowerCase()
    item.style.display = text.includes(searchTerm) ? "" : "none"
  })
}

// Funciones de utilidad
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

// Guardar datos en localStorage
function saveData() {
  localStorage.setItem("products", JSON.stringify(products))
  localStorage.setItem("brands", JSON.stringify(brands))
  localStorage.setItem("categories", JSON.stringify(categories))
  localStorage.setItem("invoiceItems", JSON.stringify(invoiceItems))
  localStorage.setItem("mixItems", JSON.stringify(mixItems))
  localStorage.setItem("sales", JSON.stringify(sales))
  localStorage.setItem("providers", JSON.stringify(providers))
  localStorage.setItem("closureHistory", JSON.stringify(closureHistory))
  localStorage.setItem("dailyCashClosure", JSON.stringify(dailyCashClosure))
  localStorage.setItem("theme", JSON.stringify(currentTheme))
}

// Cargar datos desde localStorage
function loadData() {
  const savedProducts = localStorage.getItem("products")
  const savedBrands = localStorage.getItem("brands")
  const savedCategories = localStorage.getItem("categories")
  const savedInvoiceItems = localStorage.getItem("invoiceItems")
  const savedMixItems = localStorage.getItem("mixItems")
  const savedSales = localStorage.getItem("sales")
  const savedProviders = localStorage.getItem("providers")
  const savedClosureHistory = localStorage.getItem("closureHistory")
  const savedCashClosure = localStorage.getItem("dailyCashClosure")

  if (savedProducts) {
    try {
      products = JSON.parse(savedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  if (savedBrands) {
    try {
      brands = JSON.parse(savedBrands)
    } catch (error) {
      console.error("Error loading brands:", error)
    }
  }

  if (savedCategories) {
    try {
      categories = JSON.parse(savedCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  if (savedInvoiceItems) {
    try {
      invoiceItems = JSON.parse(savedInvoiceItems)
    } catch (error) {
      console.error("Error loading invoice items:", error)
    }
  }

  if (savedMixItems) {
    try {
      mixItems = JSON.parse(savedMixItems)
    } catch (error) {
      console.error("Error loading mix items:", error)
    }
  }

  if (savedSales) {
    try {
      sales = JSON.parse(savedSales)
    } catch (error) {
      console.error("Error loading sales:", error)
    }
  }

  if (savedProviders) {
    try {
      providers = JSON.parse(savedProviders)
    } catch (error) {
      console.error("Error loading providers:", error)
    }
  }

  if (savedClosureHistory) {
    try {
      closureHistory = JSON.parse(savedClosureHistory)
    } catch (error) {
      console.error("Error loading closure history:", error)
    }
  }

  if (savedCashClosure) {
    try {
      dailyCashClosure = JSON.parse(savedCashClosure)
    } catch (error) {
      console.error("Error loading cash closure:", error)
    }
  }
}

// Funciones placeholder para mantener compatibilidad
function loadAvailableProducts() {
  const container = document.getElementById("availableProducts")
  if (!container) return

  container.innerHTML = ""

  products.forEach((product) => {
    if (product.stock > 0) {
      const item = document.createElement("div")
      item.className = "product-item"
      item.innerHTML = `
        <div class="product-info">
          <h4>${product.name}</h4>
          <p>Stock: ${product.stock} ${product.unit} | Precio: $${product.sellingPrice}</p>
        </div>
        <div class="product-actions">
          <input type="number" value="1" class="quantity-input" id="qty-${product.id}" min="1" max="${product.stock}">
          <button class="btn-sm" onclick="addToInvoice('${product.id}')">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `
      container.appendChild(item)
    }
  })
}

function loadMixProducts() {
  const container = document.getElementById("mixAvailableProducts")
  if (!container) return

  container.innerHTML = ""

  products.forEach((product) => {
    const item = document.createElement("div")
    item.className = "product-item"
    item.innerHTML = `
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>Stock: ${product.stock} ${product.unit} | Precio: $${product.purchasePrice}</p>
      </div>
      <div class="product-actions">
        <input type="number" value="1" class="quantity-input" id="mix-qty-${product.id}" min="0" max="${product.stock}">
        <button class="btn-sm" onclick="addToMix('${product.id}')">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    `
    container.appendChild(item)
  })
}

function loadFractionProducts() {
  const container = document.getElementById("fractionProducts")
  if (!container) return

  container.innerHTML = ""

  products.forEach((product) => {
    if (product.stock > 0) {
      const card = document.createElement("div")
      card.className = "fraction-card"
      card.innerHTML = `
        <div class="fraction-card-header">
          <h4>${product.name}</h4>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Stock: ${product.stock} ${product.unit}</p>
        </div>
        <div class="fraction-card-content">
          <div class="price-grid">
            <div class="price-item">
              <div class="price-label">Costo</div>
              <div class="price-value">$${product.purchasePrice}</div>
            </div>
            <div class="price-item">
              <div class="price-label">Venta</div>
              <div class="price-value">$${product.sellingPrice}</div>
            </div>
          </div>
          <label style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block;">Cantidad a fraccionar:</label>
          <input type="number" id="fraction-qty-${product.id}" value="1" min="0.1" max="${product.stock}" step="0.1" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-color); color: var(--text-color);">
          <button class="btn-primary btn-large" onclick="fractionProduct('${product.id}')" style="width: 100%;">
            <i class="fas fa-cut"></i> Fraccionar
          </button>
        </div>
      `
      container.appendChild(card)
    }
  })
}

function loadSalesData() {
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => new Date(sale.date).toDateString() === today)

  const dailySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const dailyProfit = todaySales.reduce((sum, sale) => sum + sale.profit, 0)

  // Calcular ventas del mes
  const currentDate = new Date()
  const monthlySales = sales.filter((sale) => {
    const saleDate = new Date(sale.date)
    return saleDate.getMonth() === currentDate.getMonth() && saleDate.getFullYear() === currentDate.getFullYear()
  })
  const monthlySalesTotal = monthlySales.reduce((sum, sale) => sum + sale.total, 0)
  const monthlyProfit = monthlySales.reduce((sum, sale) => sum + sale.profit, 0)

  // Actualizar cards
  const dailySalesEl = document.getElementById("dailySales")
  if (dailySalesEl) dailySalesEl.textContent = `$${dailySalesTotal.toFixed(2)}`

  const dailyTransactionsEl = document.getElementById("dailyTransactions")
  if (dailyTransactionsEl) dailyTransactionsEl.textContent = `${todaySales.length} transacciones`

  const monthlySalesEl = document.getElementById("monthlySales")
  if (monthlySalesEl) monthlySalesEl.textContent = `$${monthlySalesTotal.toFixed(2)}`

  const monthlyTransactionsEl = document.getElementById("monthlyTransactions")
  if (monthlyTransactionsEl) monthlyTransactionsEl.textContent = `${monthlySales.length} transacciones`

  const dailyProfitEl = document.getElementById("dailyProfit")
  if (dailyProfitEl) dailyProfitEl.textContent = `$${dailyProfit.toFixed(2)}`

  const monthlyProfitEl = document.getElementById("monthlyProfit")
  if (monthlyProfitEl) monthlyProfitEl.textContent = `$${monthlyProfit.toFixed(2)}`

  // Actualizar resumen de cierre
  const closeDailySalesEl = document.getElementById("closeDailySales")
  if (closeDailySalesEl) closeDailySalesEl.textContent = `$${dailySalesTotal.toFixed(2)}`

  const closeDailyCostsEl = document.getElementById("closeDailyCosts")
  if (closeDailyCostsEl) {
    const dailyCost = todaySales.reduce((sum, sale) => sum + sale.cost, 0)
    closeDailyCostsEl.textContent = `$${dailyCost.toFixed(2)}`
  }

  const closeDailyProfitEl = document.getElementById("closeDailyProfit")
  if (closeDailyProfitEl) closeDailyProfitEl.textContent = `$${dailyProfit.toFixed(2)}`

  const closeDailyTransactionsEl = document.getElementById("closeDailyTransactions")
  if (closeDailyTransactionsEl) closeDailyTransactionsEl.textContent = todaySales.length

  // Mostrar resumen de productos
  const productsSummary = calculateDailyProductsSummary()
  const summaryContainer = document.getElementById("dailyProductsSummary")
  if (summaryContainer) {
    summaryContainer.innerHTML = ""
    if (Object.keys(productsSummary).length > 0) {
      Object.entries(productsSummary).forEach(([name, data]) => {
        const item = document.createElement("div")
        item.className = "product-summary-item"
        item.style.padding = "0.5rem"
        item.style.borderBottom = "1px solid var(--border-color)"
        item.innerHTML = `
          <strong>${name}</strong>: ${data.quantity} ${data.unit} | $${data.totalRevenue.toFixed(2)} ingresos | $${data.totalProfit.toFixed(2)} ganancia
        `
        summaryContainer.appendChild(item)
      })
    } else {
      summaryContainer.innerHTML = '<p style="padding: 0.5rem; color: var(--text-muted);">Sin ventas hoy</p>'
    }
  }

  // Historial de ventas
  const historyContainer = document.getElementById("salesHistory")
  if (historyContainer) {
    historyContainer.innerHTML = ""
    todaySales
      .slice()
      .reverse()
      .forEach((sale) => {
        const itemsText = sale.items
          .map((item) => {
            const product = products.find((p) => p.id === item.productId)
            return product ? product.name : "Producto eliminado"
          })
          .join(", ")

        const item = document.createElement("div")
        item.className = "sale-item"
        item.innerHTML = `
        <div class="sale-info">
          <h5>${itemsText}</h5>
          <p>${new Date(sale.date).toLocaleTimeString()}</p>
        </div>
        <div class="sale-amount">$${sale.total.toFixed(2)}</div>
      `
        historyContainer.appendChild(item)
      })
  }
}

function handleAddProduct(e) {
  e.preventDefault()
  showNotification("Funcionalidad de agregar producto próximamente", "warning")
}

function updateStock(productId, change) {
  const product = products.find((p) => p.id === productId)
  if (product) {
    product.stock = Math.max(0, product.stock + change)
    updateDashboard()
    loadProductsTable()
    saveData()

    if (change > 0) {
      showNotification(`✅ Stock aumentado: ${product.name}`, "success")
    } else {
      showNotification(`⚠️ Stock reducido: ${product.name}`, "warning")
    }
  }
}

function updateProductPrice(productId, priceType, newPrice) {
  const product = products.find((p) => p.id === productId)
  if (product) {
    const price = Number.parseFloat(newPrice) || 0
    if (priceType === "purchase") {
      product.purchasePrice = Math.max(0, price)
      product.sellingPrice = product.purchasePrice * 1.3

      showNotification(`✅ Precio actualizado: ${product.name}`, "success")
    }

    updateDashboard()
    loadProductsTable()
    saveData()
  }
}

function confirmDeleteProduct(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const hasBeenSold = sales.some((sale) => sale.items.some((item) => item.productId === productId))

  let confirmMessage = `¿Estás seguro de que deseas eliminar "${product.name}"?`

  if (hasBeenSold) {
    confirmMessage += `\n\n⚠️ IMPORTANTE: Este producto ya se ha vendido anteriormente.`
  }

  if (confirm(confirmMessage)) {
    deleteProduct(productId, hasBeenSold)
  }
}

function deleteProduct(productId, hasBeenSold) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const productName = product.name
  products = products.filter((p) => p.id !== productId)

  updateDashboard()
  loadProductsTable()
  saveData()

  if (hasBeenSold) {
    showNotification(`Producto "${productName}" eliminado. Las ventas históricas se mantienen.`, "warning")
  } else {
    showNotification(`Producto "${productName}" eliminado completamente.`, "success")
  }
}

function getProductSalesStats(productId) {
  const productSales = sales.filter((sale) => sale.items.some((item) => item.productId === productId))

  let totalQuantitySold = 0
  let totalRevenue = 0
  let totalProfit = 0

  productSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (item.productId === productId) {
        totalQuantitySold += item.quantity
        totalRevenue += item.total
        totalProfit += item.profit
      }
    })
  })

  return {
    totalQuantitySold,
    totalRevenue,
    totalProfit,
    salesCount: productSales.length,
  }
}

function filterProducts() {
  const searchTerm = document.getElementById("searchProducts")?.value.toLowerCase() || ""
  const rows = document.querySelectorAll("#productsTableBody tr")

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(searchTerm) ? "" : "none"
  })
}

// Guardar datos automáticamente cada 30 segundos
setInterval(saveData, 30000)

// Guardar datos antes de cerrar la página
window.addEventListener("beforeunload", saveData)

// Verificar autenticación al cargar la página
window.addEventListener("load", () => {
  if (!currentUser) {
    checkAuth()
  }
})

// Función para calcular el resumen diario de productos vendidos
function calculateDailyProductsSummary() {
  const summary = {}

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        const key = product.name
        if (!summary[key]) {
          summary[key] = { quantity: 0, totalRevenue: 0, totalProfit: 0, unit: product.unit }
        }
        summary[key].quantity += item.quantity
        summary[key].totalRevenue += item.total
        summary[key].totalProfit += item.profit
      }
    })
  })

  return summary
}

// CHANGE: Completar las funciones placeholder que faltaban

function showMainTab(tabName) {
  // Ocultar todos los tabs
  const tabs = document.querySelectorAll(".tab-pane")
  tabs.forEach((tab) => tab.classList.remove("active"))

  // Desactivar todos los botones
  const buttons = document.querySelectorAll(".tab-nav-btn")
  buttons.forEach((btn) => btn.classList.remove("active"))

  // Mostrar el tab seleccionado
  const selectedTab = document.getElementById(tabName + "Tab")
  if (selectedTab) {
    selectedTab.classList.add("active")
  }

  // Activar el botón correspondiente
  const buttons_list = document.querySelectorAll(".tab-nav-btn")
  buttons_list.forEach((btn) => {
    if (btn.textContent.includes(getTabLabel(tabName))) {
      btn.classList.add("active")
    }
  })
}

function getTabLabel(tabName) {
  const labels = {
    stock: "Control de Stock",
    products: "Agregar Productos",
    invoice: "Facturador",
    sales: "Control de Ventas",
    mix: "Armado de Mix",
    fraction: "Fraccionador",
    providers: "Proveedores",
    closureHistory: "Historial de Cierres",
  }
  return labels[tabName] || ""
}

function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown")
  if (dropdown) {
    dropdown.classList.toggle("show")
  }
}

function updateUnitOptions() {
  const measurementType = document.getElementById("productMeasurement")?.value
  const unitSelect = document.getElementById("productUnit")

  if (!measurementType || !unitSelect) return

  unitSelect.innerHTML = ""
  const units = measurementTypes[measurementType] || []

  units.forEach((unit) => {
    const option = document.createElement("option")
    option.value = unit.value
    option.textContent = unit.label
    unitSelect.appendChild(option)
  })
}

function calculateSellingPrice() {
  const purchasePrice = Number.parseFloat(document.getElementById("productPurchasePrice")?.value) || 0
  const sellingPriceInput = document.getElementById("productSellingPrice")

  if (sellingPriceInput) {
    sellingPriceInput.value = (purchasePrice * 1.3).toFixed(2)
  }
}

function calculateMixSellingPrice() {
  const purchasePrice = Number.parseFloat(document.getElementById("mixPurchasePrice")?.value) || 0
  const sellingPriceInput = document.getElementById("mixSellingPrice")

  if (sellingPriceInput) {
    sellingPriceInput.value = (purchasePrice * 1.3).toFixed(2)
  }
}

function addBrand() {
  const input = document.getElementById("newBrand")
  const newBrand = input?.value.trim()

  if (!newBrand) {
    showNotification("Por favor ingresa un nombre de marca", "warning")
    return
  }

  if (brands.includes(newBrand)) {
    showNotification("Esta marca ya existe", "warning")
    return
  }

  brands.push(newBrand)
  input.value = ""
  loadBrandsAndCategories()
  saveBrandsToSelects()
  saveData()
  showNotification(`Marca "${newBrand}" agregada`, "success")
}

function addCategory() {
  const input = document.getElementById("newCategory")
  const newCategory = input?.value.trim()

  if (!newCategory) {
    showNotification("Por favor ingresa un nombre de categoría", "warning")
    return
  }

  if (categories.includes(newCategory)) {
    showNotification("Esta categoría ya existe", "warning")
    return
  }

  categories.push(newCategory)
  input.value = ""
  loadBrandsAndCategories()
  saveBrandsToSelects()
  saveData()
  showNotification(`Categoría "${newCategory}" agregada`, "success")
}

function saveBrandsToSelects() {
  const brandSelect = document.getElementById("productBrand")
  if (brandSelect) {
    const currentValue = brandSelect.value
    brandSelect.innerHTML = '<option value="">Seleccionar marca</option>'
    brands.forEach((brand) => {
      const option = document.createElement("option")
      option.value = brand
      option.textContent = brand
      brandSelect.appendChild(option)
    })
    brandSelect.value = currentValue
  }

  const categorySelect = document.getElementById("productCategory")
  if (categorySelect) {
    const currentValue = categorySelect.value
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>'
    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      categorySelect.appendChild(option)
    })
    categorySelect.value = currentValue
  }
}

function deleteBrand(brand) {
  brands = brands.filter((b) => b !== brand)
  loadBrandsAndCategories()
  saveBrandsToSelects()
  saveData()
  showNotification(`Marca "${brand}" eliminada`, "success")
}

function deleteCategory(category) {
  categories = categories.filter((c) => c !== category)
  loadBrandsAndCategories()
  saveBrandsToSelects()
  saveData()
  showNotification(`Categoría "${category}" eliminada`, "success")
}

function loadBrandsAndCategories() {
  // Cargar marcas
  const brandsList = document.getElementById("brandsList")
  if (brandsList) {
    brandsList.innerHTML = ""
    brands.forEach((brand) => {
      const tag = document.createElement("div")
      tag.className = "item-tag"
      tag.innerHTML = `
        <span>${brand}</span>
        <button onclick="deleteBrand('${brand}')" type="button">×</button>
      `
      brandsList.appendChild(tag)
    })
  }

  // Cargar categorías
  const categoriesList = document.getElementById("categoriesList")
  if (categoriesList) {
    categoriesList.innerHTML = ""
    categories.forEach((category) => {
      const tag = document.createElement("div")
      tag.className = "item-tag"
      tag.innerHTML = `
        <span>${category}</span>
        <button onclick="deleteCategory('${category}')" type="button">×</button>
      `
      categoriesList.appendChild(tag)
    })
  }

  // Actualizar selects
  saveBrandsToSelects()
}

function addToInvoice(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const quantityInput = document.getElementById(`qty-${productId}`)
  const quantity = Number.parseFloat(quantityInput?.value) || 1

  if (quantity > product.stock) {
    showNotification("Cantidad mayor al stock disponible", "error")
    return
  }

  const invoiceItem = {
    productId,
    productName: product.name,
    unit: product.unit,
    quantity,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    total: quantity * product.sellingPrice,
    cost: quantity * product.purchasePrice,
    profit: quantity * (product.sellingPrice - product.purchasePrice),
  }

  invoiceItems.push(invoiceItem)
  updateInvoiceDisplay()
  saveData()
  showNotification(`${product.name} agregado a la factura`, "success")
}

function updateInvoiceDisplay() {
  const container = document.getElementById("invoiceItems")
  const totalContainer = document.getElementById("invoiceTotal")

  if (!container) return

  if (invoiceItems.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay items en la factura</p>'
    if (totalContainer) totalContainer.style.display = "none"
    return
  }

  container.innerHTML = ""

  let subtotal = 0
  let totalProfit = 0

  invoiceItems.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.className = "product-item"
    itemElement.innerHTML = `
      <div class="product-info">
        <h4>${item.productName}</h4>
        <p>${item.quantity} ${item.unit} x $${item.sellingPrice} = $${item.total.toFixed(2)}</p>
        <p style="color: var(--success-color); font-size: 0.75rem;">Ganancia: $${item.profit.toFixed(2)}</p>
      </div>
      <button class="btn-sm" onclick="removeFromInvoice(${index})" style="background: var(--error-color); color: white;">
        <i class="fas fa-trash"></i>
      </button>
    `
    container.appendChild(itemElement)
    subtotal += item.total
    totalProfit += item.profit
  })

  if (totalContainer) {
    document.getElementById("subtotalAmount").textContent = subtotal.toFixed(2)
    document.getElementById("profitAmount").textContent = totalProfit.toFixed(2)
    document.getElementById("totalAmount").textContent = subtotal.toFixed(2)
    totalContainer.style.display = "block"
  }
}

function removeFromInvoice(index) {
  invoiceItems.splice(index, 1)
  updateInvoiceDisplay()
  saveData()
  showNotification("Item removido de la factura", "warning")
}

function processInvoice() {
  if (invoiceItems.length === 0) {
    showNotification("La factura está vacía", "warning")
    return
  }

  const total = invoiceItems.reduce((sum, item) => sum + item.total, 0)
  const cost = invoiceItems.reduce((sum, item) => sum + item.cost, 0)
  const profit = invoiceItems.reduce((sum, item) => sum + item.profit, 0)

  const sale = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    items: invoiceItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      total: item.total,
      profit: item.profit,
    })),
    total,
    cost,
    profit,
  }

  sales.push(sale)

  // Reducir stock de productos
  invoiceItems.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      product.stock -= item.quantity
    }
  })

  invoiceItems = []
  updateInvoiceDisplay()
  loadAvailableProducts()
  updateDashboard()
  loadSalesData()
  saveData()

  showNotification(`Venta procesada exitosamente! Total: $${total.toFixed(2)}`, "success")
}

function addToMix(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const quantityInput = document.getElementById(`mix-qty-${productId}`)
  const quantity = Number.parseFloat(quantityInput?.value) || 0

  if (quantity <= 0) {
    showNotification("Ingresa una cantidad válida", "warning")
    return
  }

  if (quantity > product.stock) {
    showNotification("Cantidad mayor al stock disponible", "error")
    return
  }

  const mixItem = {
    productId,
    productName: product.name,
    unit: product.unit,
    quantity,
    purchasePrice: product.purchasePrice,
    cost: quantity * product.purchasePrice,
  }

  mixItems.push(mixItem)
  updateMixDisplay()
  saveData()
  showNotification(`${product.name} agregado al mix`, "success")
}

function updateMixDisplay() {
  const container = document.getElementById("mixItems")
  const formContainer = document.getElementById("mixForm")

  if (!container) return

  if (mixItems.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay productos en el mix</p>'
    if (formContainer) formContainer.style.display = "none"
    return
  }

  container.innerHTML = ""

  let totalCost = 0

  mixItems.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.className = "product-item"
    itemElement.innerHTML = `
      <div class="product-info">
        <h4>${item.productName}</h4>
        <p>${item.quantity} ${item.unit} x $${item.purchasePrice} = $${item.cost.toFixed(2)}</p>
      </div>
      <button class="btn-sm" onclick="removeFromMix(${index})" style="background: var(--error-color); color: white;">
        <i class="fas fa-trash"></i>
      </button>
    `
    container.appendChild(itemElement)
    totalCost += item.cost
  })

  const purchasePriceInput = document.getElementById("mixPurchasePrice")
  if (purchasePriceInput) {
    purchasePriceInput.value = totalCost.toFixed(2)
    calculateMixSellingPrice()
  }

  if (formContainer) formContainer.style.display = "block"
}

function removeFromMix(index) {
  mixItems.splice(index, 1)
  updateMixDisplay()
  saveData()
  showNotification("Producto removido del mix", "warning")
}

function createMix() {
  const mixName = document.getElementById("mixName")?.value.trim()
  const mixSellingPrice = Number.parseFloat(document.getElementById("mixSellingPrice")?.value) || 0

  if (!mixName) {
    showNotification("Por favor ingresa un nombre para el mix", "warning")
    return
  }

  const newMix = {
    id: Date.now().toString(),
    name: mixName,
    code: `MIX-${Date.now()}`,
    brand: "Mix Personalizado",
    category: "Mix",
    stock: 1,
    minStock: 0,
    purchasePrice: mixItems.reduce((sum, item) => sum + item.cost, 0),
    sellingPrice: mixSellingPrice,
    unit: "unidad",
    measurementType: "quantity",
    isFractioned: false,
    composition: mixItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
    })),
    priceHistory: [
      {
        date: new Date().toISOString(),
        purchasePrice: mixItems.reduce((sum, item) => sum + item.cost, 0),
        sellingPrice: mixSellingPrice,
      },
    ],
  }

  products.push(newMix)
  mixItems = []
  updateMixDisplay()
  loadMixProducts()
  loadProductsTable()
  saveData()

  showNotification(`Mix "${mixName}" creado exitosamente`, "success")
}

function fractionProduct(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const quantityInput = document.getElementById(`fraction-qty-${productId}`)
  const fractionQuantity = Number.parseFloat(quantityInput?.value) || 0

  if (fractionQuantity <= 0 || fractionQuantity > product.stock) {
    showNotification("Cantidad inválida", "error")
    return
  }

  const fractionedProduct = {
    id: Date.now().toString(),
    name: `${product.name} (${fractionQuantity} ${product.unit})`,
    code: `${product.code}-FRAC`,
    brand: product.brand,
    category: product.category,
    stock: 1,
    minStock: 0,
    purchasePrice: product.purchasePrice * fractionQuantity,
    sellingPrice: product.sellingPrice * fractionQuantity,
    unit: product.unit,
    measurementType: product.measurementType,
    isFractioned: true,
    originalProductId: productId,
    fractionQuantity: fractionQuantity,
    priceHistory: [
      {
        date: new Date().toISOString(),
        purchasePrice: product.purchasePrice * fractionQuantity,
        sellingPrice: product.sellingPrice * fractionQuantity,
      },
    ],
  }

  products.push(fractionedProduct)
  product.stock -= fractionQuantity
  saveData()
  updateDashboard()
  loadProductsTable()
  loadFractionProducts()
  showFractionedProducts()

  showNotification(`Fracción de ${fractionQuantity} ${product.unit} creada exitosamente`, "success")
}

function showFractionedProducts() {
  const fractionedProducts = products.filter((p) => p.isFractioned)

  if (fractionedProducts.length > 0) {
    const section = document.getElementById("fractionedProductsSection")
    if (section) section.style.display = "block"

    const container = document.getElementById("fractionedProducts")
    if (container) {
      container.innerHTML = ""
      fractionedProducts.slice(-5).forEach((product) => {
        const item = document.createElement("div")
        item.className = "fractioned-item"
        item.innerHTML = `
          <div>
            <strong>${product.name}</strong>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Costo: $${product.purchasePrice.toFixed(2)} | Venta: $${product.sellingPrice.toFixed(2)}</p>
          </div>
        `
        container.appendChild(item)
      })
    }
  }
}
