/**
 * JARDINES DE ALLENDE HIDALGO
 * Sistema de Administración de Condominios - Client-side SPA
 * 
 * Lógica de Negocio y Persistencia en LocalStorage
 */

// --- CONSTANTES Y CONFIGURACIÓN ---
const START_DATE = new Date("2025-04-01T00:00:00");
const CUOTA_MANTENIMIENTO = 840.00;
const CUOTA_AGUA_FIJO = 82.00;

const MONTHS_ES = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril", "05": "Mayo", "06": "Junio",
  "07": "Julio", "08": "Agosto", "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
};// --- ESTADO GLOBAL DE LA APLICACIÓN ---
let appState = {
  currentView: "dashboard",
  selectedDeptoId: null,
  activeTowerTab: "Torre 1",
  chartInstance: null,
  excelImportData: null, // Guardará los datos validados del Excel
  isCompactView: false,
  waterChartInstance: null,
  pendingDeleteTxId: null,
  editingTxId: null,
  chartExpensesMonthlyInstance: null,
  chartExpensesGroupInstance: null,
  expensesExcelImportData: null
};

// --- BASE DE DATOS LOCAL (API / DB SYNC) ---
async function apiPost(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": window.csrfToken
      },
      body: JSON.stringify({ data })
    });
    return await response.json();
  } catch (error) {
    console.error("Error syncing data with backend:", error);
  }
}

const DB = {
  getDepartments: () => {
    let depts = window.localDbState?.ja_departments || [];
    if (window.currentUser && window.currentUser.role === 'condomino') {
      return depts.filter(d => d.id === window.currentUser.department_id);
    }
    return depts;
  },
  getAllDepartments: () => {
    return window.localDbState?.ja_departments || [];
  },
  saveDepartments: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_departments = data;
    }
    apiPost('/api/sync-departments', data);
  },
  
  getTransactions: () => {
    let txs = window.localDbState?.ja_transactions || [];
    if (window.currentUser && window.currentUser.role === 'condomino') {
      return txs.filter(t => t.deptoId === window.currentUser.department_id);
    }
    return txs;
  },
  getAllTransactions: () => {
    return window.localDbState?.ja_transactions || [];
  },
  saveTransactions: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_transactions = data;
    }
    apiPost('/api/sync-transactions', data);
  },
  
  getWaterReadings: () => {
    let readings = window.localDbState?.ja_water_readings || [];
    if (window.currentUser && window.currentUser.role === 'condomino') {
      return readings.filter(r => r.deptoId === window.currentUser.department_id);
    }
    return readings;
  },
  saveWaterReadings: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_water_readings = data;
    }
    apiPost('/api/sync-water-readings', data);
  },
  
  getAuditLog: () => {
    return window.localDbState?.ja_audit_log || [];
  },
  saveAuditLog: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_audit_log = data;
    }
    apiPost('/api/sync-audit-log', data);
  },
  getMoneyDestinations: () => {
    return window.localDbState?.ja_money_destinations || [];
  },
  getExpenses: () => {
    return window.localDbState?.ja_expenses || [];
  },
  saveExpenses: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_expenses = data;
    }
    apiPost('/api/sync-expenses', data);
  },
  getExpenseGroups: () => {
    return window.localDbState?.ja_expense_groups || [];
  },
  saveExpenseGroups: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_expense_groups = data;
    }
    apiPost('/api/sync-expense-groups', data);
  },
  getExpenseSubgroups: () => {
    return window.localDbState?.ja_expense_subgroups || [];
  },
  saveExpenseSubgroups: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_expense_subgroups = data;
    }
    apiPost('/api/sync-expense-subgroups', data);
  },
  getPaymentMethods: () => {
    return window.localDbState?.ja_payment_methods || [];
  },
  savePaymentMethods: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_payment_methods = data;
    }
    apiPost('/api/sync-payment-methods', data);
  },
  getNotices: () => {
    return window.localDbState?.ja_notices || [];
  },
  saveNotices: (data) => {
    if (window.localDbState) {
      window.localDbState.ja_notices = data;
    }
    apiPost('/api/sync-notices', data);
  }
};

// --- INICIALIZACIÓN DE DATOS ---
function initDatabase() {
  // 1. Inicializar Departamentos si no existen
  if (!window.localDbState || !window.localDbState.ja_departments || window.localDbState.ja_departments.length === 0) {
    const depts = [];
    
    // Torre 1: 20 departamentos (T1-01 a T1-20)
    for (let i = 1; i <= 20; i++) {
      const numStr = String(i).padStart(2, "0");
      depts.push({
        id: `T1-${numStr}`,
        torre: "Torre 1",
        tipo: "departamento",
        numero: `${i}`,
        contactoNombre: "",
        contactoRol: "propietario",
        contactoEmail: "",
        contactoCelular: "",
        notas: "",
        status: "normal"
      });
    }
    
    // Torre 2: 18 departamentos (T2-01 a T2-18) + 2 locales (T2-L1, T2-L2)
    for (let i = 1; i <= 18; i++) {
      const numStr = String(i).padStart(2, "0");
      depts.push({
        id: `T2-${numStr}`,
        torre: "Torre 2",
        tipo: "departamento",
        numero: `${i}`,
        contactoNombre: "",
        contactoRol: "propietario",
        contactoEmail: "",
        contactoCelular: "",
        notas: "",
        status: "normal"
      });
    }
    depts.push({
      id: "T2-L1",
      torre: "Torre 2",
      tipo: "local",
      numero: "Local 1",
      contactoNombre: "",
      contactoRol: "propietario",
      contactoEmail: "",
      contactoCelular: "",
      notas: "",
      status: "normal"
    });
    depts.push({
      id: "T2-L2",
      torre: "Torre 2",
      tipo: "local",
      numero: "Local 2",
      contactoNombre: "",
      contactoRol: "propietario",
      contactoEmail: "",
      contactoCelular: "",
      notas: "",
      status: "normal"
    });
    
    // Torre 3: 20 departamentos (T3-01 a T3-20)
    for (let i = 1; i <= 20; i++) {
      const numStr = String(i).padStart(2, "0");
      depts.push({
        id: `T3-${numStr}`,
        torre: "Torre 3",
        tipo: "departamento",
        numero: `${i}`,
        contactoNombre: "",
        contactoRol: "propietario",
        contactoEmail: "",
        contactoCelular: "",
        notas: "",
        status: "normal"
      });
    }
    
    DB.saveDepartments(depts);
  } else {
    // Migración para departamentos existentes que no tienen el campo status
    const depts = DB.getDepartments();
    let updated = false;
    depts.forEach(d => {
      if (!d.status) {
        d.status = "normal";
        updated = true;
      }
    });
    if (updated) {
      DB.saveDepartments(depts);
    }
  }

  // 2. Inicializar transacciones, lecturas y log de auditoría
  if (!window.localDbState || !window.localDbState.ja_transactions) {
    DB.saveTransactions([]);
  }
  if (!window.localDbState || !window.localDbState.ja_water_readings) {
    DB.saveWaterReadings([]);
  }
  if (!window.localDbState || !window.localDbState.ja_audit_log) {
    DB.saveAuditLog([]);
  }
  if (!window.localDbState || !window.localDbState.ja_money_destinations) {
    window.localDbState.ja_money_destinations = [
      { id: 1, nombre: "Banorte Miguel", administracionActual: true },
      { id: 2, nombre: "NU Miguel", administracionActual: true },
      { id: 3, nombre: "Cuenta Carlos", administracionActual: false },
      { id: 4, nombre: "Carlos no Reportado", administracionActual: false },
      { id: 5, nombre: "Ajuste por Acuerdo", administracionActual: true },
      { id: 6, nombre: "Efectivo", administracionActual: true },
      { id: 7, nombre: "Otro", administracionActual: true }
    ];
  }
  if (!window.localDbState || !window.localDbState.ja_expenses) {
    window.localDbState.ja_expenses = [];
  }
  if (!window.localDbState || !window.localDbState.ja_expense_groups) {
    window.localDbState.ja_expense_groups = [
      { id: 1, nombre: "Mantenimiento General" },
      { id: 2, nombre: "Servicios Públicos" },
      { id: 3, nombre: "Administración y Operación" },
      { id: 4, nombre: "Seguridad y Vigilancia" }
    ];
  }
  if (!window.localDbState || !window.localDbState.ja_expense_subgroups) {
    window.localDbState.ja_expense_subgroups = [
      { id: 1, groupId: 1, nombre: "Pintura y Reparaciones" },
      { id: 2, groupId: 1, nombre: "Jardinería y Limpieza" },
      { id: 3, groupId: 2, nombre: "Luz de Áreas Comunes" },
      { id: 4, groupId: 2, nombre: "Agua Caseta y Riego" },
      { id: 5, groupId: 3, nombre: "Honorarios de Administración" },
      { id: 6, groupId: 3, nombre: "Papelería e Impresiones" },
      { id: 7, groupId: 4, nombre: "Guardias de Caseta" },
      { id: 8, groupId: 4, nombre: "Reparación de Portón Eléctrico" }
    ];
  }
  if (!window.localDbState || !window.localDbState.ja_payment_methods) {
    window.localDbState.ja_payment_methods = [
      { id: 1, nombre: "Transferencia Bancaria" },
      { id: 2, nombre: "Efectivo" },
      { id: 3, nombre: "Cheque" },
      { id: 4, nombre: "Tarjeta de Crédito / Débito" }
    ];
  }
  if (!window.localDbState || !window.localDbState.ja_notices) {
    window.localDbState.ja_notices = [
      {
        id: 1,
        titulo: "¡Bienvenidos al Nuevo Sistema de Control Financiero!",
        contenido: "Estimados condóminos, les damos la bienvenida al portal digital de Jardines de Allende Hidalgo. A partir de hoy podrán consultar estados de cuenta resumidos, consumos de agua e informes de gastos directamente desde aquí de forma transparente.",
        fechaPublicacion: "2026-06-28",
        fechaVigencia: null,
        activo: true
      }
    ];
  }

  // 3. Generar cargos fijos automáticos hasta la fecha actual
  generateAutoCharges();
}

/**
 * Genera cargos recurrentes automáticos mensuales (Mantenimiento y Agua Fijo)
 * desde el 1 de abril de 2025 hasta el mes actual.
 */
function generateAutoCharges() {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed

  let updated = false;

  // Cargar Cargos Iniciales de Administración Morada ($1.00) y Cuota extraordinaria 2025 ($2500) para todos los deptos
  depts.forEach(dept => {
    // 1. Adeudo Administración Morada
    const hasInitialDeuda = transactions.some(t => 
      t.deptoId === dept.id && 
      t.fecha === "2025-04-01" && 
      t.concepto === "Adeudo Administración Morada"
    );
    if (!hasInitialDeuda) {
      transactions.push({
        id: `AC-INIT-DEUDA-${dept.id}`,
        deptoId: dept.id,
        fecha: "2025-04-01",
        tipo: "cargo",
        concepto: "Adeudo Administración Morada",
        mesCorrespondiente: "2025-04",
        monto: 1.00
      });
      updated = true;
    }

    // 2. Cuota extraordinaria 2025
    const hasCuotaExtra = transactions.some(t => 
      t.deptoId === dept.id && 
      t.fecha === "2025-04-01" && 
      t.concepto === "Cuota extraordinaria 2025"
    );
    if (!hasCuotaExtra) {
      transactions.push({
        id: `AC-INIT-EXTRA-${dept.id}`,
        deptoId: dept.id,
        fecha: "2025-04-01",
        tipo: "cargo",
        concepto: "Cuota extraordinaria 2025",
        mesCorrespondiente: "2025-04",
        monto: 2500.00
      });
      updated = true;
    }
  });

  // Recorrer meses desde 2025-04 hasta hoy
  let loopYear = START_DATE.getFullYear();
  let loopMonth = START_DATE.getMonth() + 1;

  while (loopYear < currentYear || (loopYear === currentYear && loopMonth <= currentMonth)) {
    const monthStr = `${loopYear}-${String(loopMonth).padStart(2, "0")}`;
    const chargeDate = `${monthStr}-01`;

    depts.forEach(dept => {
      // Excluir departamentos desocupados de los cargos automáticos del mes correspondiente
      // (solo a partir de que estén desocupados)
      if (dept.status === "desocupado") {
        return;
      }

      // 1. Cargo de Mantenimiento
      const hasMaint = transactions.some(t => 
        t.deptoId === dept.id && 
        t.mesCorrespondiente === monthStr && 
        t.concepto === "Cuota Mantenimiento"
      );

      if (!hasMaint) {
        transactions.push({
          id: `AC-M-${dept.id}-${monthStr}`,
          deptoId: dept.id,
          fecha: chargeDate,
          tipo: "cargo",
          concepto: "Cuota Mantenimiento",
          mesCorrespondiente: monthStr,
          monto: CUOTA_MANTENIMIENTO
        });
        updated = true;
      }

      // 2. Cargo de Agua Fijo
      const hasWaterFijo = transactions.some(t => 
        t.deptoId === dept.id && 
        t.mesCorrespondiente === monthStr && 
        t.concepto === "Agua Fijo"
      );

      if (!hasWaterFijo) {
        transactions.push({
          id: `AC-WF-${dept.id}-${monthStr}`,
          deptoId: dept.id,
          fecha: chargeDate,
          tipo: "cargo",
          concepto: "Agua Fijo",
          mesCorrespondiente: monthStr,
          monto: CUOTA_AGUA_FIJO
        });
        updated = true;
      }
    });

    // Avanzar mes
    loopMonth++;
    if (loopMonth > 12) {
      loopMonth = 1;
      loopYear++;
    }
  }

  if (updated) {
    DB.saveTransactions(transactions);
    console.log("Cargos fijos automáticos actualizados correctamente.");
  }
}

// --- CONTROLLER: ENRUTAMIENTO Y VISTAS ---
function navigateTo(viewId) {
  appState.currentView = viewId;
  
  // Ocultar todas las vistas y remover clases activas de la navegación
  document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active-view"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  
  // Activar la vista y el elemento del menú
  const viewElement = document.getElementById(`view-${viewId}`);
  if (viewElement) {
    viewElement.classList.add("active-view");
  }
  
  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) {
    navItem.classList.add("active");
  } else if (viewId === "detalle") {
    // Si estamos en la vista de detalle, mantén el menú de Condominio activo
    const condoNavItem = document.querySelector('.nav-item[data-view="condominio"]');
    if (condoNavItem) condoNavItem.classList.add("active");
  }

  // Actualizar título de cabecera
  const viewTitle = document.getElementById("view-title");
  const viewSubtitle = document.getElementById("view-subtitle");

  switch (viewId) {
    case "dashboard":
      viewTitle.textContent = "Dashboard";
      viewSubtitle.textContent = "Resumen general de las finanzas del condominio";
      renderDashboard();
      break;
    case "condominio":
      viewTitle.textContent = "Condominio";
      viewSubtitle.textContent = "Consulta de cuentas por torre y departamento";
      renderCondominio();
      break;
    case "agua":
      viewTitle.textContent = "Lecturas de Agua";
      viewSubtitle.textContent = "Captura de lecturas trimestrales y cobros por excedentes";
      renderWaterReadingsView();
      break;
    case "importar":
      viewTitle.textContent = "Importar Excel";
      viewSubtitle.textContent = "Importación inicial de pagos y actualización de base de datos";
      renderImportExcelView();
      break;
    case "detalle":
      viewTitle.textContent = "Ficha del Departamento";
      viewSubtitle.textContent = "Historial completo de cargos y pagos";
      renderDeptoDetailView();
      break;
    case "reportes":
      viewTitle.textContent = "Reportes";
      viewSubtitle.textContent = "Generación de estados de cuenta individuales y globales";
      renderReportsView();
      break;
    case "configuracion":
      viewTitle.textContent = "Configuración";
      viewSubtitle.textContent = "Mantenimiento del sistema y bitácora de auditoría";
      renderConfigView();
      break;
    case "resumen-saldos":
      viewTitle.textContent = "Vista Resumida de Saldos";
      viewSubtitle.textContent = "Saldos generales de todas las propiedades del condominio";
      renderResumenSaldosView();
      break;
    case "gastos":
      viewTitle.textContent = "Gastos (Egresos)";
      viewSubtitle.textContent = "Control de egresos, reportes mensuales y categorías";
      renderGastosView();
      break;
  }

  // Cerrar sidebar móvil si está abierto
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.remove("open");
}

// --- COMPONENTE: TOAST NOTIFICATIONS ---
function showToast(title, message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "alert-triangle";
  if (type === "info") iconName = "info";

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  // Desvanecimiento
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease reverse forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// --- UTILERÍA FINANCIERA ---
/**
 * Calcula el saldo acumulado para un departamento específico sumando todos los abonos
 * y restando los cargos.
 */
function calculateDeptoBalance(deptoId, transactions) {
  const deptoTransactions = transactions.filter(t => t.deptoId === deptoId);
  let balance = 0;
  deptoTransactions.forEach(t => {
    if (t.tipo === "abono") balance += t.monto;
    else if (t.tipo === "cargo") balance -= t.monto;
  });
  let roundedBalance = Math.round(balance * 100) / 100;
  if (roundedBalance === -0) roundedBalance = 0;
  return roundedBalance;
}

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  });
  return formatter.format(amount);
}

function formatMonthES(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    const yr = parts[0];
    const mo = parts[1];
    return `${MONTHS_ES[mo] || mo} ${yr}`;
  }
  return monthStr;
}

// --- VISTA: DASHBOARD ---
function renderDashboard() {
  // Render Notices Board
  renderDashboardNotices();

  const transactions = DB.getTransactions();
  const depts = DB.getDepartments();
  const destinations = DB.getMoneyDestinations();

  // Crear un Set de nombres de cuentas que pertenecen a la administración actual
  const activeDestNames = new Set(
    destinations.filter(d => d.administracionActual).map(d => d.nombre)
  );

  // Calcular métricas
  let totalCargado = 0;
  let totalCobrado = 0;
  let totalCobradoActual = 0;
  let totalCobradoPasado = 0;
  
  transactions.forEach(t => {
    if (t.tipo === "cargo") {
      totalCargado += t.monto;
    } else if (t.tipo === "abono") {
      totalCobrado += t.monto;
      const isActual = activeDestNames.has(t.destinoAbono);
      if (isActual) {
        totalCobradoActual += t.monto;
      } else {
        totalCobradoPasado += t.monto;
      }
    }
  });

  const deudaPendiente = totalCargado - totalCobrado;
  const porcentajeCobranza = totalCargado > 0 ? (totalCobrado / totalCargado) * 100 : 100;

  // Actualizar UI
  document.getElementById("dashboard-total-charged").textContent = formatCurrency(totalCargado);
  document.getElementById("dashboard-total-collected").textContent = formatCurrency(totalCobrado);
  
  const elActual = document.getElementById("dashboard-collected-actual");
  const elPast = document.getElementById("dashboard-collected-past");
  if (elActual) elActual.textContent = formatCurrency(totalCobradoActual);
  if (elPast) elPast.textContent = formatCurrency(totalCobradoPasado);

  document.getElementById("dashboard-total-debt").textContent = formatCurrency(Math.max(0, deudaPendiente));
  document.getElementById("dashboard-collection-rate").textContent = `${porcentajeCobranza.toFixed(1)}%`;

  // Top Morosos (Deudores)
  const deptoSaldos = depts.map(d => {
    const saldo = calculateDeptoBalance(d.id, transactions);
    return {
      id: d.id,
      nombre: d.contactoNombre || "Sin Registrar",
      saldo: saldo
    };
  }).filter(item => item.saldo < 0) // Solo deudores
    .sort((a, b) => a.saldo - b.saldo); // Más negativo primero (mayor deuda)

  const topMorososBody = document.querySelector("#table-top-morosos tbody");
  topMorososBody.innerHTML = "";

  const top5 = deptoSaldos.slice(0, 5);
  if (top5.length === 0) {
    topMorososBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay cuentas con saldo deudor</td></tr>`;
  } else {
    top5.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="text-gold font-bold">${item.id}</span></td>
        <td>${item.nombre}</td>
        <td class="text-right text-red font-bold">${formatCurrency(Math.abs(item.saldo))}</td>
        <td>
          <button class="btn btn-sm btn-secondary btn-goto-depto" data-depto="${item.id}">
            <i data-lucide="eye" class="inline-icon"></i> Ver
          </button>
        </td>
      `;
      topMorososBody.appendChild(tr);
    });

    // Vincular botones "Ver"
    document.querySelectorAll(".btn-goto-depto").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const deptoId = e.currentTarget.getAttribute("data-depto");
        appState.selectedDeptoId = deptoId;
        navigateTo("detalle");
      });
    });
  }

  // Renderizar Gráfico
  renderFinancialChart(transactions);
  renderTowerSummaries();

  // Renderizar últimos 5 abonos por destino de administración actual
  const containerRecentAbonos = document.getElementById("container-recent-abonos");
  if (containerRecentAbonos) {
    containerRecentAbonos.innerHTML = "";
    
    // Obtener abonos
    const abonos = transactions.filter(t => t.tipo === "abono");
    
    // Agrupar por destino
    const activeDestinations = destinations.filter(d => d.administracionActual);
    
    if (activeDestinations.length === 0) {
      containerRecentAbonos.innerHTML = `<p class="text-muted text-center span-3" style="grid-column: 1 / -1; padding: 20px;">No hay cuentas de administración actual configuradas.</p>`;
    } else {
      activeDestinations.forEach(dest => {
        // Filtrar y ordenar los últimos 5 para esta cuenta
        const destAbonos = abonos
          .filter(t => t.destinoAbono === dest.nombre)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5);
          
        const box = document.createElement("div");
        box.className = "recent-abonos-box";
        box.style = "background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 15px;";
        
        let rowsHtml = "";
        if (destAbonos.length === 0) {
          rowsHtml = `<tr><td colspan="3" style="text-align: center; color: rgba(255,255,255,0.4); font-size: 0.8rem; padding: 10px 0;">Sin abonos registrados</td></tr>`;
        } else {
          destAbonos.forEach(a => {
            rowsHtml += `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="font-size: 0.8rem; padding: 8px 0; color: rgba(255,255,255,0.6);">${a.fecha}</td>
                <td style="font-size: 0.8rem; padding: 8px 0; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${a.concepto}">${a.concepto}</td>
                <td style="font-size: 0.8rem; padding: 8px 0; text-align: right; font-weight: bold; color: var(--emerald-primary);">${formatCurrency(a.monto)}</td>
              </tr>
            `;
          });
        }
        
        box.innerHTML = `
          <h4 style="margin: 0 0 10px 0; color: var(--gold-primary); font-size: 0.95rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 6px;">${dest.nombre}</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: rgba(255,255,255,0.4); font-size: 0.75rem;">
                <th style="padding-bottom: 4px; font-weight: 500;">Fecha</th>
                <th style="padding-bottom: 4px; font-weight: 500;">Concepto</th>
                <th style="padding-bottom: 4px; font-weight: 500; text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        `;
        containerRecentAbonos.appendChild(box);
      });
    }
  }

  lucide.createIcons();
}

function renderFinancialChart(transactions) {
  const ctx = document.getElementById("financialChart").getContext("2d");
  
  if (appState.chartInstance) {
    appState.chartInstance.destroy();
  }

  // Agrupar cargos y abonos por mes
  const monthlyData = {};
  
  // Inicializar meses desde abril 2025 hasta hoy
  const today = new Date();
  let loopYear = START_DATE.getFullYear();
  let loopMonth = START_DATE.getMonth() + 1;
  const endYear = today.getFullYear();
  const endMonth = today.getMonth() + 1;

  while (loopYear < endYear || (loopYear === endYear && loopMonth <= endMonth)) {
    const monthStr = `${loopYear}-${String(loopMonth).padStart(2, "0")}`;
    monthlyData[monthStr] = { cargos: 0, abonos: 0 };
    
    loopMonth++;
    if (loopMonth > 12) {
      loopMonth = 1;
      loopYear++;
    }
  }

  // Sumar transacciones
  transactions.forEach(t => {
    if (monthlyData[t.mesCorrespondiente]) {
      if (t.tipo === "cargo") {
        monthlyData[t.mesCorrespondiente].cargos += t.monto;
      } else if (t.tipo === "abono") {
        monthlyData[t.mesCorrespondiente].abonos += t.monto;
      }
    }
  });

  const labels = Object.keys(monthlyData).map(m => formatMonthES(m));
  const cargos = Object.values(monthlyData).map(d => d.cargos);
  const abonos = Object.values(monthlyData).map(d => d.abonos);

  // Configuración de Chart.js
  appState.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Cargos Generados",
          data: cargos,
          backgroundColor: "rgba(217, 119, 6, 0.55)",
          borderColor: "#d97706",
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          label: "Abonos/Cobros",
          data: abonos,
          backgroundColor: "rgba(16, 185, 129, 0.55)",
          borderColor: "#10b981",
          borderWidth: 1.5,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#cbd5e1",
            font: { family: "Inter", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: "rgba(6, 20, 15, 0.95)",
          titleColor: "#fff",
          bodyColor: "#e2e8f0",
          borderColor: "rgba(16, 185, 129, 0.2)",
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#cbd5e1" }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#cbd5e1",
            callback: function(value) { return "$" + value.toLocaleString(); }
          }
        }
      }
    }
  });
}

// --- VISTA: CONDOMINIO ---
function renderCondominio() {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  const gridContainer = document.getElementById("properties-grid-container");
  
  const searchInput = document.getElementById("condo-search-input").value.toLowerCase().trim();
  const statusFilter = document.getElementById("condo-status-filter").value;

  // Filtrar departamentos por Torre Activa, Buscador y Estado
  let filtered = depts.filter(d => d.torre === appState.activeTowerTab);

  if (searchInput) {
    filtered = filtered.filter(d => 
      d.id.toLowerCase().includes(searchInput) ||
      (d.contactoNombre && d.contactoNombre.toLowerCase().includes(searchInput)) ||
      (d.contactoCelular && d.contactoCelular.includes(searchInput))
    );
  }

  // Agrega saldo a los deptos
  const deptData = filtered.map(d => {
    const saldo = calculateDeptoBalance(d.id, transactions);
    return { ...d, saldo };
  });

  // Filtrar por estado
  if (statusFilter === "current") {
    filtered = deptData.filter(d => d.saldo >= 0);
  } else if (statusFilter === "debt") {
    filtered = deptData.filter(d => d.saldo < 0);
  } else {
    filtered = deptData;
  }

  // Renderizar las Tarjetas
  gridContainer.innerHTML = "";
  
  if (filtered.length === 0) {
    gridContainer.innerHTML = `<div class="no-results-box text-center text-muted" style="grid-column: 1/-1; padding: 40px;">
      <i data-lucide="building-2" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
      <p>No se encontraron propiedades que coincidan con la búsqueda.</p>
    </div>`;
    lucide.createIcons();
    updateTowersBadges();
    return;
  }

  // Manejar Vista Compacta en la Grilla
  if (appState.isCompactView) {
    gridContainer.classList.add("compact-view");
  } else {
    gridContainer.classList.remove("compact-view");
  }

  filtered.forEach(dept => {
    const card = document.createElement("div");
    const isDebt = dept.saldo < 0;
    
    // Construir lista de clases de estado
    let statusClass = isDebt ? 'status-debt' : 'status-ok';
    if (dept.status === "desocupado") {
      statusClass = "status-vacant";
    } else if (dept.status === "en_venta") {
      statusClass = "status-sale";
    }
    
    card.className = `property-card glass-card ${statusClass} ${dept.tipo === 'local' ? 'commercial-premise' : ''} ${appState.isCompactView ? 'compact-card' : ''}`;
    card.setAttribute("data-depto-id", dept.id);

    const balanceText = isDebt ? `-${formatCurrency(Math.abs(dept.saldo))}` : formatCurrency(dept.saldo);
    
    // Rol badge
    let roleBadge = "";
    if (dept.contactoNombre) {
      roleBadge = dept.contactoRol === 'administrador' ? '<span class="badge badge-admin">Adm</span>' : '<span class="badge badge-owner">Prop</span>';
    }
    
    // Status badge (Desocupado/En Venta)
    let statusBadge = "";
    if (dept.status === "desocupado") {
      statusBadge = '<span class="badge badge-vacant">Vacío</span>';
    } else if (dept.status === "en_venta") {
      statusBadge = '<span class="badge badge-sale">Venta</span>';
    }

    card.innerHTML = `
      <div class="property-card-top">
        <span class="property-number">${dept.numero}</span>
        <span class="property-type-tag">${dept.tipo}</span>
      </div>
      <p class="property-owner">${dept.contactoNombre || '<span class="text-muted font-normal italic">Sin registrar</span>'}</p>
      <div class="property-owner-role" style="display: flex; gap: 4px;">${roleBadge} ${statusBadge}</div>
      <div class="property-card-bottom">
        <span class="property-balance-label">Saldo Neto</span>
        <span class="property-balance-value">${balanceText}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      appState.selectedDeptoId = dept.id;
      navigateTo("detalle");
    });

    gridContainer.appendChild(card);
  });

  lucide.createIcons();
  updateTowersBadges();
}

function updateTowersBadges() {
  const depts = DB.getDepartments();
  const t1Count = depts.filter(d => d.torre === "Torre 1").length;
  const t2Count = depts.filter(d => d.torre === "Torre 2").length;
  const t3Count = depts.filter(d => d.torre === "Torre 3").length;
  
  document.getElementById("badge-t1").textContent = t1Count;
  document.getElementById("badge-t2").textContent = t2Count;
  document.getElementById("badge-t3").textContent = t3Count;
}

// --- VISTA: DETALLE DE DEPARTAMENTO (FICHA TÉCNICA) ---
function renderDeptoDetailView() {
  if (!appState.selectedDeptoId) {
    navigateTo("condominio");
    return;
  }

  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  
  const dept = depts.find(d => d.id === appState.selectedDeptoId);
  if (!dept) {
    showToast("Error", "Departamento no encontrado", "error");
    navigateTo("condominio");
    return;
  }

  // 1. Mostrar metadatos del departamento
  document.getElementById("depto-detail-id").textContent = dept.id;
  document.getElementById("depto-detail-tower").textContent = dept.torre;
  document.getElementById("depto-detail-name").textContent = dept.contactoNombre || "No registrado";
  
  const roleBadge = document.getElementById("depto-detail-role");
  roleBadge.textContent = dept.contactoRol;
  roleBadge.className = `badge ${dept.contactoRol === 'administrador' ? 'badge-admin' : 'badge-owner'}`;
  
  document.getElementById("depto-detail-email").textContent = dept.contactoEmail || "No registrado";
  document.getElementById("depto-detail-phone").textContent = dept.contactoCelular || "No registrado";
  document.getElementById("depto-detail-notes").textContent = dept.notas || dept.notes || "Sin notas adicionales registradas.";
  
  const convenioRow = document.getElementById("depto-detail-convenio-row");
  if (convenioRow) {
    convenioRow.style.display = dept.conConvenio ? "flex" : "none";
  }

  // Establecer valor del selector de estado
  document.getElementById("depto-status-select").value = dept.status || "normal";

  // 2. Calcular saldo del departamento
  const saldo = calculateDeptoBalance(dept.id, transactions);
  const balanceBox = document.getElementById("depto-detail-balance-box");
  const balanceValueEl = document.getElementById("depto-detail-balance");
  const balanceStatusEl = document.getElementById("depto-detail-balance-status");

  balanceValueEl.textContent = saldo < 0 ? `-${formatCurrency(Math.abs(saldo))}` : formatCurrency(saldo);
  
  if (saldo < 0) {
    balanceBox.className = "depto-balance-box shadow-glow status-debt";
    balanceStatusEl.textContent = "Tiene saldo pendiente (Adeudo)";
  } else {
    balanceBox.className = "depto-balance-box shadow-glow status-ok";
    balanceStatusEl.textContent = saldo > 0 ? "Tiene saldo a favor" : "Al corriente";
  }

  // 3. Renderizar transacciones en el Ledger (Cronológico)
  const deptoTransactions = transactions.filter(t => t.deptoId === dept.id);
  
  // Ordenar cronológicamente (cargos primero si son la misma fecha)
  deptoTransactions.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    if (a.tipo !== b.tipo) return a.tipo === 'cargo' ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  // Calcular saldos acumulativos antes de filtrar para mantener coherencia en el ledger
  let runningBalance = 0;
  deptoTransactions.forEach(t => {
    if (t.tipo === "abono") runningBalance += t.monto;
    else if (t.tipo === "cargo") runningBalance -= t.monto;
    let rounded = Math.round(runningBalance * 100) / 100;
    if (rounded === -0) rounded = 0;
    t.accumulatedBalance = rounded;
  });

  // Aplicar filtros de fecha
  const filterFrom = document.getElementById("ledger-filter-from").value;
  const filterTo = document.getElementById("ledger-filter-to").value;
  
  let filteredTransactions = deptoTransactions;
  if (filterFrom) {
    filteredTransactions = filteredTransactions.filter(t => t.fecha >= filterFrom);
  }
  if (filterTo) {
    filteredTransactions = filteredTransactions.filter(t => t.fecha <= filterTo);
  }

  const ledgerBody = document.querySelector("#table-ledger tbody");
  ledgerBody.innerHTML = "";

  if (filteredTransactions.length === 0) {
    ledgerBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No se registran transacciones para los filtros seleccionados.</td></tr>`;
  } else {
    filteredTransactions.forEach(t => {
      const isAbono = t.tipo === "abono";
      const tr = document.createElement("tr");
      tr.className = isAbono ? "abono-row" : "cargo-row";
      
      const balanceClass = t.accumulatedBalance < 0 ? "text-red font-bold" : "text-emerald font-bold";

      tr.innerHTML = `
        <td>${t.fecha}</td>
        <td>${t.concepto}</td>
        <td>${formatMonthES(t.mesCorrespondiente)}</td>
        <td>${t.destinoAbono || '-'}</td>
        <td class="text-right ${!isAbono ? 'monto-cargo font-medium' : 'text-muted'}">${!isAbono ? formatCurrency(t.monto) : '-'}</td>
        <td class="text-right ${isAbono ? 'monto-abono' : 'text-muted'}">${isAbono ? formatCurrency(t.monto) : '-'}</td>
        <td class="text-right ${balanceClass}">${t.accumulatedBalance < 0 ? '-' : ''}${formatCurrency(Math.abs(t.accumulatedBalance))}</td>
        <td class="text-center">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn-icon-sm btn-print-receipt" data-id="${t.id}" title="Imprimir Recibo"><i data-lucide="printer" style="width: 12px; height: 12px;"></i></button>
            <button class="btn-icon-sm btn-edit-tx" data-id="${t.id}" title="Editar transacción"><i data-lucide="edit-2" style="width: 12px; height: 12px;"></i></button>
            <button class="btn-icon-sm btn-delete btn-delete-tx" data-id="${t.id}" title="Eliminar transacción"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
          </div>
        </td>
      `;
      ledgerBody.appendChild(tr);
    });

    // Registrar handlers para botones de acción del ledger
    ledgerBody.querySelectorAll(".btn-edit-tx").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const txId = e.currentTarget.getAttribute("data-id");
        openEditTransactionModal(txId);
      });
    });

    ledgerBody.querySelectorAll(".btn-delete-tx").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const txId = e.currentTarget.getAttribute("data-id");
        confirmDeleteTransaction(txId);
      });
    });

    ledgerBody.querySelectorAll(".btn-print-receipt").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const txId = e.currentTarget.getAttribute("data-id");
        generateReceiptPDF(txId, dept);
      });
    });
  }

  // Rellenar modales con datos del depto actual
  document.getElementById("edit-depto-id").value = dept.id;
  document.getElementById("modal-edit-depto-id").textContent = dept.id;
  document.getElementById("edit-contact-name").value = dept.contactoNombre;
  document.getElementById("edit-contact-role").value = dept.contactoRol;
  document.getElementById("edit-contact-email").value = dept.contactoEmail;
  document.getElementById("edit-contact-phone").value = dept.contactoCelular;
  document.getElementById("edit-contact-notes").value = dept.notas || dept.notes || "";
  document.getElementById("edit-contact-convenio").checked = !!dept.conConvenio;

  lucide.createIcons();
}

// --- VISTA: LECTURAS DE AGUA ---
function renderWaterReadingsView() {
  const period = document.getElementById("water-period-select").value;
  const depts = DB.getDepartments();
  const readings = DB.getWaterReadings();
  const limitBase = parseFloat(document.getElementById("water-limit-input").value) || 0;
  const pricePerM3 = parseFloat(document.getElementById("water-price-input").value) || 0;

  const tableBody = document.querySelector("#table-water-capture tbody");
  tableBody.innerHTML = "";

  // Filtrar solo departamentos (los locales comerciales no suelen tener lectura de agua excedente o según req. "Torre 2 tiene 2 locales Local 1 y Local 2. Las lecturas de agua aplican para las 60 propiedades").
  // El plan dice: "Tabla de captura rápida para las 60 propiedades." Así que incluiremos los 60.
  depts.forEach(dept => {
    const currentReading = readings.find(r => r.deptoId === dept.id && r.periodo === period);
    
    let initReadingValue = "";
    let finalReadingValue = "";
    
    if (currentReading) {
      initReadingValue = currentReading.lecturaInicial;
      finalReadingValue = currentReading.lecturaFinal;
    } else {
      // Intentar recuperar la lectura final del periodo anterior como inicial
      const prevPeriod = getPreviousPeriod(period);
      if (prevPeriod) {
        const prevReading = readings.find(r => r.deptoId === dept.id && r.periodo === prevPeriod);
        if (prevReading) {
          initReadingValue = prevReading.lecturaFinal;
        }
      }
    }

    const tr = document.createElement("tr");
    tr.className = "water-capture-row";
    tr.setAttribute("data-depto-id", dept.id);

    tr.innerHTML = `
      <td><span class="text-gold font-bold">${dept.id}</span></td>
      <td>${dept.torre}</td>
      <td class="text-xs uppercase">${dept.tipo}</td>
      <td class="property-owner-cell">${dept.contactoNombre || '<span class="text-muted italic">No asignado</span>'}</td>
      <td>
        <input type="number" step="0.01" min="0" class="input-water-init" value="${initReadingValue}" placeholder="0.0">
      </td>
      <td>
        <input type="number" step="0.01" min="0" class="input-water-final" value="${finalReadingValue}" placeholder="0.0">
      </td>
      <td class="text-right cell-consumption font-medium">-</td>
      <td class="text-right cell-excess text-warning font-bold">-</td>
      <td class="text-right cell-charge text-gold font-bold">-</td>
    `;

    tableBody.appendChild(tr);
    
    // Calcular inicialmente si hay valores cargados
    calculateRowWater(tr, limitBase, pricePerM3);
  });

  // Vincular eventos keyup/change en los inputs
  tableBody.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", (e) => {
      const tr = e.target.closest("tr");
      calculateRowWater(tr, limitBase, pricePerM3);
    });
  });

  // Vinculamos buscador rápido en la tabla de agua
  const waterSearch = document.getElementById("water-search-input");
  waterSearch.addEventListener("input", () => {
    const q = waterSearch.value.toLowerCase().trim();
    document.querySelectorAll("#table-water-capture tbody tr").forEach(row => {
      const deptoId = row.getAttribute("data-depto-id").toLowerCase();
      if (deptoId.includes(q)) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });
  });
  renderWaterComparisonChart();
  lucide.createIcons();
}

function calculateRowWater(row, limitBase, pricePerM3) {
  const initInput = row.querySelector(".input-water-init").value;
  const finalInput = row.querySelector(".input-water-final").value;

  const consumptionCell = row.querySelector(".cell-consumption");
  const excessCell = row.querySelector(".cell-excess");
  const chargeCell = row.querySelector(".cell-charge");

  if (initInput !== "" && finalInput !== "") {
    const initVal = parseFloat(initInput);
    const finalVal = parseFloat(finalInput);
    
    const consumption = Math.max(0, finalVal - initVal);
    const excess = Math.max(0, consumption - limitBase);
    const charge = excess * pricePerM3;

    consumptionCell.textContent = `${consumption.toFixed(2)} m³`;
    excessCell.textContent = `${excess.toFixed(2)} m³`;
    chargeCell.textContent = formatCurrency(charge);
    
    // Alerta de consumo anormal (> 25 m³)
    if (consumption > 25) {
      row.classList.add("water-alert-row");
      if (!row.querySelector(".water-alert-icon")) {
        const ownerCell = row.querySelector(".property-owner-cell");
        ownerCell.innerHTML = `<i data-lucide="alert-triangle" class="water-alert-icon inline-icon" title="Consumo anormal alto (>25m³)" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;"></i>` + ownerCell.innerHTML;
        lucide.createIcons();
      }
    } else {
      row.classList.remove("water-alert-row");
      const icon = row.querySelector(".water-alert-icon");
      if (icon) icon.remove();
    }
    
    if (excess > 0) {
      excessCell.className = "text-right cell-excess text-warning font-bold";
      chargeCell.className = "text-right cell-charge text-gold font-bold";
    } else {
      excessCell.className = "text-right cell-excess text-muted";
      chargeCell.className = "text-right cell-charge text-muted";
    }
  } else {
    consumptionCell.textContent = "-";
    excessCell.textContent = "-";
    chargeCell.textContent = "-";
    row.classList.remove("water-alert-row");
    const icon = row.querySelector(".water-alert-icon");
    if (icon) icon.remove();
  }
}

function getPreviousPeriod(period) {
  const regex = /^(\d{4})-Q(\d)$/;
  const match = period.match(regex);
  if (!match) return null;
  
  let year = parseInt(match[1]);
  let q = parseInt(match[2]);

  q--;
  if (q < 1) {
    q = 4;
    year--;
  }

  return `${year}-Q${q}`;
}

function getPeriodDates(period) {
  const regex = /^(\d{4})-Q(\d)$/;
  const match = period.match(regex);
  if (!match) return { end: "2025-06-30", month: "2025-06" };
  
  const year = match[1];
  const q = match[2];
  
  if (q === "1") return { end: `${year}-03-31`, month: `${year}-03` };
  if (q === "2") return { end: `${year}-06-30`, month: `${year}-06` };
  if (q === "3") return { end: `${year}-09-30`, month: `${year}-09` };
  if (q === "4") return { end: `${year}-12-31`, month: `${year}-12` };
  
  return { end: `${year}-06-30`, month: `${year}-06` };
}

// --- GUARDAR LECTURAS Y GENERAR CARGOS ---
function saveWaterReadings() {
  const period = document.getElementById("water-period-select").value;
  const limitBase = parseFloat(document.getElementById("water-limit-input").value) || 0;
  const pricePerM3 = parseFloat(document.getElementById("water-price-input").value) || 0;

  const readings = DB.getWaterReadings();
  const transactions = DB.getTransactions();

  const rows = document.querySelectorAll("#table-water-capture tbody tr");
  let hasError = false;
  const toSaveReadings = [];
  const toSaveTransactions = [...transactions];

  const periodDates = getPeriodDates(period);

  for (let row of rows) {
    const deptoId = row.getAttribute("data-depto-id");
    const initInput = row.querySelector(".input-water-init").value;
    const finalInput = row.querySelector(".input-water-final").value;

    if (initInput === "" || finalInput === "") {
      // Ignorar filas incompletas
      continue;
    }

    const initVal = parseFloat(initInput);
    const finalVal = parseFloat(finalInput);

    if (finalVal < initVal) {
      showToast("Error de validación", `La lectura final es menor que la inicial en ${deptoId}`, "error");
      row.querySelector(".input-water-final").style.borderColor = "var(--color-danger)";
      hasError = true;
      break;
    } else {
      row.querySelector(".input-water-final").style.borderColor = "";
    }

    const consumption = finalVal - initVal;
    const excess = Math.max(0, consumption - limitBase);
    const chargeMonto = excess * pricePerM3;

    toSaveReadings.push({
      id: `${deptoId}-${period}`,
      deptoId,
      periodo: period,
      lecturaInicial: initVal,
      lecturaFinal: finalVal,
      excedente: excess,
      precioPorM3: pricePerM3,
      montoCobrado: chargeMonto
    });

    // Registrar o actualizar el cargo en transacciones
    const conceptName = `Excedente Agua Trimestre ${period}`;
    const existingTransIdx = toSaveTransactions.findIndex(t => 
      t.deptoId === deptoId && 
      t.concepto === conceptName
    );

    if (chargeMonto > 0) {
      const transObj = {
        id: `W-${deptoId}-${period}`,
        deptoId: deptoId,
        fecha: periodDates.end,
        tipo: "cargo",
        concepto: conceptName,
        mesCorrespondiente: periodDates.month,
        monto: chargeMonto
      };

      if (existingTransIdx >= 0) {
        toSaveTransactions[existingTransIdx] = transObj;
      } else {
        toSaveTransactions.push(transObj);
      }
    } else {
      // Si la lectura se actualizó y ahora da $0, eliminamos la transacción de excedente si existía
      if (existingTransIdx >= 0) {
        toSaveTransactions.splice(existingTransIdx, 1);
      }
    }
  }

  if (hasError) return;

  // Guardar en DB local
  // Actualizar la colección de lecturas (reemplazando los del mismo periodo)
  const filteredReadings = readings.filter(r => r.periodo !== period);
  const finalReadings = [...filteredReadings, ...toSaveReadings];

  DB.saveWaterReadings(finalReadings);
  DB.saveTransactions(toSaveTransactions);

  showToast("Éxito", `Lecturas de agua guardadas y cargos generados para ${period}`, "success");
  logAuditEvent("INSERT", "water_reading", period, `Registró/actualizó lecturas de agua y cargos de excedente para el periodo ${period}`);
  renderWaterReadingsView();
}

// --- VISTA: IMPORTACIÓN DE EXCEL ---
function renderImportExcelView() {
  const isImported = localStorage.getItem("ja_excel_imported") === "true";
  const dropZone = document.getElementById("excel-drop-zone");
  
  if (isImported) {
    // Mostrar advertencia de importación previa
    const warningDiv = document.createElement("div");
    warningDiv.className = "badge badge-admin mt-4 text-center block w-full";
    warningDiv.style.padding = "10px";
    warningDiv.style.textTransform = "none";
    warningDiv.innerHTML = `<i data-lucide="alert-triangle" class="inline-icon"></i> <strong>Aviso:</strong> Ya se han importado registros previamente. Aplicar otra importación podría duplicar abonos.`;
    
    // Insertar antes del dropzone si no existe ya
    const cardBody = dropZone.parentElement;
    if (!cardBody.querySelector(".import-warning-banner")) {
      warningDiv.classList.add("import-warning-banner");
      cardBody.insertBefore(warningDiv, dropZone);
      lucide.createIcons();
    }
  }

  resetImportState();
}

function resetImportState() {
  appState.excelImportData = null;
  document.getElementById("excel-file-input").value = "";
  document.getElementById("import-file-details").classList.add("hidden");
  document.getElementById("excel-drop-zone").classList.remove("hidden");
  
  const previewPlaceholder = document.getElementById("preview-placeholder");
  const previewTableContainer = document.getElementById("preview-table-container");
  const applyBtn = document.getElementById("btn-apply-import");
  
  previewPlaceholder.classList.remove("hidden");
  previewTableContainer.classList.add("hidden");
  applyBtn.classList.add("disabled");
  applyBtn.setAttribute("disabled", "true");
  document.getElementById("import-count").textContent = "0";
}

function handleExcelFileSelect(file) {
  if (!file) return;

  // Detalles del archivo
  document.getElementById("import-file-name").textContent = file.name;
  document.getElementById("import-file-size").textContent = `${(file.size / 1024).toFixed(1)} KB`;
  
  document.getElementById("excel-drop-zone").classList.add("hidden");
  document.getElementById("import-file-details").classList.remove("hidden");

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      
      // Buscar la hoja de "Abonos"
      let sheetName = "Abonos";
      if (!workbook.SheetNames.includes(sheetName)) {
        // Fallback a la segunda hoja, o la primera
        sheetName = workbook.SheetNames[1] || workbook.SheetNames[0];
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      validateAndPreviewExcelData(jsonData);

    } catch (err) {
      console.error(err);
      showToast("Error de lectura", "No se pudo leer el archivo Excel. Asegúrate de que no esté corrupto.", "error");
      resetImportState();
    }
  };
  reader.readAsArrayBuffer(file);
}

function validateAndPreviewExcelData(rows) {
  if (!rows || rows.length < 2) {
    showToast("Archivo Vacío", "No se encontraron filas de datos en el archivo.", "error");
    resetImportState();
    return;
  }

  // Detectar cabeceras en la fila 0
  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  
  // Buscar índices de las columnas necesarias
  const idxTorre = headers.findIndex(h => h.includes("torre"));
  const idxDepto = headers.findIndex(h => h.includes("depto") || h.includes("departamento"));
  const idxFecha = headers.findIndex(h => h.includes("fecha"));
  const idxConcepto = headers.findIndex(h => h.includes("concepto"));
  const idxMes = headers.findIndex(h => h.includes("mes"));
  const idxDestino = headers.findIndex(h => h.includes("destino"));
  const idxMonto = headers.findIndex(h => h.includes("monto"));

  if (idxTorre === -1 || idxDepto === -1 || idxFecha === -1 || idxMonto === -1) {
    showToast("Formato incorrecto", "El archivo Excel no contiene las columnas requeridas (Torre, Departamento, Fecha, Monto)", "error");
    resetImportState();
    return;
  }

  const depts = DB.getDepartments();
  const validRecords = [];
  const previewRowsHtml = [];
  let hasErrors = false;

  // Recorrer filas de datos (omitir la cabecera)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(val => val === null || val === undefined || val === "")) {
      continue; // Ignorar filas vacías
    }

    const rawTorre = row[idxTorre] ? String(row[idxTorre]).trim() : "";
    const rawDepto = row[idxDepto] ? String(row[idxDepto]).trim() : "";
    const rawFecha = row[idxFecha] ? row[idxFecha] : "";
    const rawConcepto = idxConcepto !== -1 && row[idxConcepto] ? String(row[idxConcepto]).trim() : "Abono Importado";
    let rawDestino = idxDestino !== -1 && row[idxDestino] ? String(row[idxDestino]).trim() : "Banorte Miguel";
    
    // Normalizar nombres de bancos
    if (rawDestino === "BBVA") rawDestino = "Banorte Miguel";
    else if (rawDestino === "Santander") rawDestino = "NU Miguel";
    
    const rawMonto = idxMonto !== -1 ? row[idxMonto] : "";

    // Validar datos
    let errorMsg = [];
    let isRowValid = true;

    // 1. Validar Torre
    if (!["Torre 1", "Torre 2", "Torre 3"].includes(rawTorre)) {
      errorMsg.push("Torre inválida");
      isRowValid = false;
    }

    // 2. Identificar y validar Departamento
    let deptoId = "";
    if (isRowValid) {
      if (rawTorre === "Torre 1") {
        const num = parseInt(rawDepto);
        if (num >= 1 && num <= 20) {
          deptoId = `T1-${String(num).padStart(2, "0")}`;
        }
      } else if (rawTorre === "Torre 2") {
        if (rawDepto === "Local 1" || rawDepto === "19" || rawDepto.toLowerCase() === "local1") {
          deptoId = "T2-L1";
        } else if (rawDepto === "Local 2" || rawDepto === "20" || rawDepto.toLowerCase() === "local2") {
          deptoId = "T2-L2";
        } else {
          const num = parseInt(rawDepto);
          if (num >= 1 && num <= 18) {
            deptoId = `T2-${String(num).padStart(2, "0")}`;
          }
        }
      } else if (rawTorre === "Torre 3") {
        const num = parseInt(rawDepto);
        if (num >= 1 && num <= 20) {
          deptoId = `T3-${String(num).padStart(2, "0")}`;
        }
      }

      if (!deptoId || !depts.some(d => d.id === deptoId)) {
        errorMsg.push(`Depto/Local no existe en ${rawTorre}`);
        isRowValid = false;
      }
    }

    // 3. Validar Fecha
    let finalFecha = null;
    if (rawFecha) {
      if (rawFecha instanceof Date) {
        finalFecha = rawFecha.toISOString().split("T")[0];
      } else if (typeof rawFecha === "number") {
        const date = new Date((rawFecha - 25569) * 86400 * 1000);
        finalFecha = date.toISOString().split("T")[0];
      } else if (typeof rawFecha === "string") {
        const match = rawFecha.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (match) {
          finalFecha = `${match[1]}-${match[2]}-${match[3]}`;
        }
      }
    }
    
    if (!finalFecha) {
      errorMsg.push("Fecha inválida (AAAA-MM-DD)");
      isRowValid = false;
    }

    // 4. Validar Monto
    const finalMonto = parseFloat(rawMonto);
    if (isNaN(finalMonto) || finalMonto <= 0) {
      errorMsg.push("Monto debe ser número positivo");
      isRowValid = false;
    }

    // 5. Derivar Mes correspondiente (YYYY-MM)
    let finalMes = "";
    if (isRowValid) {
      finalMes = finalFecha.substring(0, 7);
    }

    if (isRowValid) {
      validRecords.push({
        id: `EX-${deptoId}-${finalFecha}-${Math.floor(Math.random() * 10000)}`,
        deptoId: deptoId,
        fecha: finalFecha,
        tipo: "abono",
        concepto: rawConcepto,
        mesCorrespondiente: finalMes,
        destinoAbono: rawDestino || "Banorte Miguel",
        monto: finalMonto
      });
    } else {
      hasErrors = true;
    }

    // Fila de previsualización HTML
    previewRowsHtml.push(`
      <tr class="${!isRowValid ? 'bg-red-950/20' : ''}">
        <td>${rawTorre}</td>
        <td><span class="font-bold">${rawDepto}</span></td>
        <td>${finalFecha || '<span class="text-red font-medium">' + rawFecha + '</span>'}</td>
        <td>${rawConcepto}</td>
        <td>${finalMes || '-'}</td>
        <td>${rawDestino}</td>
        <td class="text-right text-emerald font-bold">${formatCurrency(finalMonto) || rawMonto}</td>
        <td>
          ${isRowValid ? 
            '<span class="status-valid"><i data-lucide="check-circle" class="inline-icon"></i> Listo</span>' : 
            `<span class="status-invalid" title="${errorMsg.join(', ')}"><i data-lucide="x-circle" class="inline-icon"></i> Error</span>`
          }
        </td>
      </tr>
    `);
  }

  // Actualizar tabla en la UI
  const previewBody = document.querySelector("#table-import-preview tbody");
  previewBody.innerHTML = previewRowsHtml.join("");

  document.getElementById("preview-placeholder").classList.add("hidden");
  document.getElementById("preview-table-container").classList.remove("hidden");

  // Mostrar conteo de válidos
  document.getElementById("import-count").textContent = validRecords.length;

  const applyBtn = document.getElementById("btn-apply-import");

  if (validRecords.length > 0 && !hasErrors) {
    applyBtn.classList.remove("disabled");
    applyBtn.removeAttribute("disabled");
    appState.excelImportData = validRecords;
    showToast("Validación exitosa", "Todos los registros de Excel son válidos y listos para importar.", "success");
  } else if (validRecords.length > 0 && hasErrors) {
    applyBtn.classList.add("disabled");
    applyBtn.setAttribute("disabled", "true");
    showToast("Errores encontrados", "Corrige las filas marcadas con error en tu archivo Excel para continuar.", "error");
  } else {
    applyBtn.classList.add("disabled");
    applyBtn.setAttribute("disabled", "true");
    showToast("Sin datos válidos", "No se encontraron registros válidos para importar.", "error");
  }

  lucide.createIcons();
}

function applyImportedData() {
  if (!appState.excelImportData || appState.excelImportData.length === 0) return;

  const transactions = DB.getTransactions();
  const newTransactions = [...transactions, ...appState.excelImportData];

  DB.saveTransactions(newTransactions);
  localStorage.setItem("ja_excel_imported", "true");

  logAuditEvent("INSERT", "transaction", "import", `Importó ${appState.excelImportData.length} transacciones desde Excel`);
  showToast("Importación exitosa", `Se han importado ${appState.excelImportData.length} registros correctamente.`, "success");
  navigateTo("dashboard");
}

// --- GENERADOR DE ESTADO DE CUENTA PDF (jsPDF) ---
function generateAnnualPDFReport(overrideDeptoId, overrideYear) {
  const deptoId = (typeof overrideDeptoId === "string") ? overrideDeptoId : appState.selectedDeptoId;
  let year;
  if (typeof overrideYear === "string" || typeof overrideYear === "number") {
    year = String(overrideYear);
  } else {
    const yearSelect = document.getElementById("pdf-year-select");
    year = yearSelect ? yearSelect.value : "2026";
  }

  if (!deptoId) return;

  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();

  const dept = depts.find(d => d.id === deptoId);
  if (!dept) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");

  // Paleta de colores PDF
  const colorEmerald = [6, 78, 59]; // Verde esmeralda oscuro
  const colorGold = [180, 83, 9]; // Oro/Marrón dorado

  // 1. Calcular balance acumulado del año anterior (Saldo Inicial)
  let initialBalance = 0;
  const priorYearLimit = `${year}-01-01`;

  transactions.forEach(t => {
    if (t.deptoId === deptoId && t.fecha < priorYearLimit) {
      if (t.tipo === "abono") initialBalance += t.monto;
      else if (t.tipo === "cargo") initialBalance -= t.monto;
    }
  });

  // 2. Transacciones del año seleccionado
  const yearTransactions = transactions.filter(t => 
    t.deptoId === deptoId && 
    t.fecha.startsWith(year)
  );

  // Ordenar cronológicamente
  yearTransactions.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    if (a.tipo !== b.tipo) return a.tipo === 'cargo' ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  // Construir cuerpo de la tabla para AutoTable
  const tableData = [];
  let runningBalance = initialBalance;

  // Insertar fila del saldo inicial si es distinto de cero o si no es la fecha absoluta de inicio
  tableData.push([
    "Saldo Inicial Acumulado",
    `Al 1 de Ene ${year}`,
    "-",
    "-",
    "-",
    (runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance))
  ]);

  yearTransactions.forEach(t => {
    const isAbono = t.tipo === "abono";
    if (isAbono) runningBalance += t.monto;
    else runningBalance -= t.monto;

    tableData.push([
      t.concepto,
      t.fecha,
      t.destinoAbono || "-",
      !isAbono ? formatCurrency(t.monto) : "-",
      isAbono ? formatCurrency(t.monto) : "-",
      (runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance))
    ]);
  });

  // CABECERA: Logotipo e Información del Condominio
  // Dibujar imagen del logo
  const logoImg = document.getElementById("app-logo");
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", 40, 35, 40, 40);
    } catch (e) {
      console.warn("No se pudo cargar la imagen del logo en el PDF:", e);
    }
  }

  // Nombre de la marca
  doc.setTextColor(6, 78, 59); // Verde esmeralda oscuro
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Jardines de Allende Hidalgo", 95, 52);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text("ADMINISTRACIÓN DE CONDOMINIO", 95, 68);

  // Fecha de generación del reporte
  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Gris azulado / Slate
  doc.text(`Fecha Reporte: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 430, 52);
  doc.text(`Año de consulta: ${year}`, 430, 68);

  // Línea divisora de cabecera
  doc.setDrawColor(217, 119, 6); // Oro / Dorado
  doc.setLineWidth(1.5);
  doc.line(40, 95, 555, 95);

  // FICHA TÉCNICA DEL DEPARTAMENTO
  doc.setFillColor(248, 250, 252);
  doc.rect(40, 130, 515, 90, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 130, 515, 90, "S");

  doc.setTextColor(50, 50, 50);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DATOS DE LA PROPIEDAD", 50, 148);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Propiedad: ${dept.torre} - Depto/Local ${dept.numero} (${dept.id})`, 50, 168);
  doc.text(`Contacto: ${dept.contactoNombre || 'Sin Registrar'} (${dept.contactoRol.toUpperCase()})`, 50, 184);
  doc.text(`Celular: ${dept.contactoCelular || 'N/D'}   |   Email: ${dept.contactoEmail || 'N/D'}`, 50, 200);

  // Recuadro del saldo final destacado
  doc.setFillColor(runningBalance < 0 ? 254 : 240); // Fondo rojo claro si adeuda
  if (runningBalance < 0) doc.setFillColor(254, 242, 242);
  else doc.setFillColor(240, 253, 250);
  
  doc.rect(380, 140, 160, 70, "F");
  doc.setDrawColor(runningBalance < 0 ? 252 : 16);
  if (runningBalance < 0) doc.setDrawColor(252, 165, 165);
  else doc.setDrawColor(16, 185, 129);
  doc.rect(380, 140, 160, 70, "S");

  doc.setTextColor(100, 100, 100);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SALDO ACUMULADO FINAL", 395, 158);

  doc.setFontSize(15);
  doc.setTextColor(runningBalance < 0 ? 220 : 16);
  if (runningBalance < 0) doc.setTextColor(220, 38, 38);
  else doc.setTextColor(16, 185, 129);
  doc.text((runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance)), 395, 182);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(runningBalance < 0 ? "Cuenta con adeudos" : "Al corriente / Saldo a favor", 395, 198);

  // TABLA DE TRANSACCIONES
  doc.autoTable({
    startY: 240,
    margin: { left: 40, right: 40 },
    head: [["Concepto", "Fecha de Operación", "Destino de Abono", "Cargos ($)", "Abonos ($)", "Saldo ($)"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: colorEmerald,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left"
    },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 100 },
      2: { cellWidth: 75 },
      3: { cellWidth: 60, halign: "right" },
      4: { cellWidth: 60, halign: "right" },
      5: { cellWidth: 60, halign: "right" }
    },
    styles: {
      fontSize: 8,
      cellPadding: 6
    },
    didParseCell: function(data) {
      // Pintar el saldo final o saldos negativos en rojo en la tabla
      if (data.column.index === 5) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.startsWith("-")) {
          data.cell.styles.textColor = [220, 38, 38]; // Rojo
        }
      }
      // Fila de saldo inicial
      if (data.row.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  // Guardar archivo
  doc.save(`Estado_Cuenta_${dept.id}_${year}.pdf`);
  showToast("PDF Generado", `Estado de cuenta descargado para el departamento ${dept.id}`, "success");
}

// --- INICIALIZAR EVENTOS DE INTERFAZ (LISTENERS) ---
function initEventListeners() {
  
  // 1. Sidebar Navigation
  document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const viewId = e.currentTarget.getAttribute("data-view");
      if (!viewId) {
        return; // Allow standard navigation for links without data-view (like Panel Admin)
      }
      e.preventDefault();
      navigateTo(viewId);
    });
  });

  // 2. Mobile toggle
  const mobileToggle = document.querySelector(".mobile-toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Clic fuera del sidebar móvil lo cierra
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 991) {
      if (sidebar && sidebar.classList.contains("open") && 
          !sidebar.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    }
  });

  // 3. Condo View - Tower Tabs
  document.querySelectorAll(".tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tabs .tab-btn").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      appState.activeTowerTab = e.currentTarget.getAttribute("data-tower");
      renderCondominio();
    });
  });

  // Condo View - Buscador y filtros
  document.getElementById("condo-search-input").addEventListener("input", renderCondominio);
  document.getElementById("condo-status-filter").addEventListener("change", renderCondominio);

  // 4. Detalle Depto - Volver a condominio
  document.querySelectorAll(".back-to-condo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      navigateTo("condominio");
    });
  });

  // Detalle Depto - Editar contacto modal
  const editContactModal = document.getElementById("modal-edit-contact");
  document.getElementById("btn-edit-contact").addEventListener("click", () => {
    editContactModal.classList.add("open");
  });
  
  const closeEditModal = () => editContactModal.classList.remove("open");
  document.getElementById("btn-close-edit-modal").addEventListener("click", closeEditModal);
  document.getElementById("btn-cancel-edit").addEventListener("click", closeEditModal);

  document.getElementById("form-edit-contact").addEventListener("submit", (e) => {
    e.preventDefault();
    const deptoId = document.getElementById("edit-depto-id").value;
    const depts = DB.getDepartments();
    const idx = depts.findIndex(d => d.id === deptoId);

    if (idx >= 0) {
      const name = document.getElementById("edit-contact-name").value.trim();
      const role = document.getElementById("edit-contact-role").value;
      const email = document.getElementById("edit-contact-email").value.trim();
      const phone = document.getElementById("edit-contact-phone").value.trim();
      const notes = document.getElementById("edit-contact-notes").value.trim();
      const conConvenio = document.getElementById("edit-contact-convenio").checked;

      if (conConvenio && !notes) {
        showToast("Error de Validación", "Las notas no pueden estar vacías si el departamento está con convenio.", "error");
        return;
      }

      depts[idx].contactoNombre = name;
      depts[idx].contactoRol = role;
      depts[idx].contactoEmail = email;
      depts[idx].contactoCelular = phone;
      depts[idx].notas = notes;
      depts[idx].notes = notes;
      depts[idx].conConvenio = conConvenio;

      DB.saveDepartments(depts);
      showToast("Ficha Actualizada", `Los datos de contacto de ${deptoId} se guardaron.`, "success");
      closeEditModal();
      renderDeptoDetailView();
    }
  });

  // Detalle Depto - Registrar Transacción modal (Abono / Cargo)
  const addAbonoModal = document.getElementById("modal-add-abono");
  
  const setupTransactionModal = (tipo) => {
    const deptoId = appState.selectedDeptoId;
    document.getElementById("abono-depto-id").value = deptoId;
    document.getElementById("modal-abono-depto-id").textContent = deptoId;
    document.getElementById("abono-tipo").value = tipo;
    
    document.getElementById("abono-monto").value = "";
    document.getElementById("abono-fecha").value = new Date().toISOString().split("T")[0];
    
    const titleEl = document.getElementById("abono-modal-title");
    const labelMontoEl = document.getElementById("label-abono-monto");
    const labelFechaEl = document.getElementById("label-abono-fecha");
    const labelConceptoEl = document.getElementById("label-abono-concepto");
    const groupDestinoEl = document.getElementById("group-abono-destino");
    const submitBtn = document.getElementById("btn-submit-abono");
    const destinoEl = document.getElementById("abono-destino");
    const conceptoEl = document.getElementById("abono-concepto");
    
    if (tipo === "abono") {
      titleEl.innerHTML = `Registrar Abono Manual - <span id="modal-abono-depto-id" class="text-gold">${deptoId}</span>`;
      labelMontoEl.textContent = "Monto del Abono ($ MXN):";
      labelFechaEl.textContent = "Fecha del Depósito:";
      labelConceptoEl.textContent = "Concepto / Descripción del Pago:";
      groupDestinoEl.classList.remove("hidden");
      destinoEl.value = "Banorte Miguel";
      destinoEl.required = true;
      conceptoEl.value = "Abono Transferencia Banorte Miguel";
      conceptoEl.placeholder = "Ej. Abono Transferencia Banorte Miguel";
      submitBtn.className = "btn btn-gold";
      submitBtn.textContent = "Registrar Pago";
    } else {
      titleEl.innerHTML = `Registrar Cargo Manual - <span id="modal-abono-depto-id" class="text-gold">${deptoId}</span>`;
      labelMontoEl.textContent = "Monto del Cargo ($ MXN):";
      labelFechaEl.textContent = "Fecha de Cargo:";
      labelConceptoEl.textContent = "Concepto / Descripción del Cargo:";
      groupDestinoEl.classList.add("hidden");
      destinoEl.required = false;
      destinoEl.value = "";
      conceptoEl.value = "Cuota Extraordinaria";
      conceptoEl.placeholder = "Ej. Cuota Extraordinaria: Pintura";
      submitBtn.className = "btn btn-danger";
      submitBtn.textContent = "Registrar Cargo";
    }
  };

  document.getElementById("btn-open-abono-modal").addEventListener("click", () => {
    setupTransactionModal("abono");
    addAbonoModal.classList.add("open");
  });
  
  const btnOpenCargo = document.getElementById("btn-open-cargo-modal");
  if (btnOpenCargo) {
    btnOpenCargo.addEventListener("click", () => {
      setupTransactionModal("cargo");
      addAbonoModal.classList.add("open");
    });
  }
  
  const closeAbonoModal = () => addAbonoModal.classList.remove("open");
  document.getElementById("btn-close-abono-modal").addEventListener("click", closeAbonoModal);
  document.getElementById("btn-cancel-abono").addEventListener("click", closeAbonoModal);

  // Vincular cambio de banco/destino en el modal de abonos para cambiar concepto sugerido
  document.getElementById("abono-destino").addEventListener("change", (e) => {
    if (document.getElementById("abono-tipo").value !== "abono") return;
    const destino = e.target.value;
    const inputConcepto = document.getElementById("abono-concepto");
    if (destino === "Efectivo") {
      inputConcepto.value = "Abono Efectivo";
    } else if (destino === "Otro") {
      inputConcepto.value = "Abono Otro";
    } else {
      inputConcepto.value = `Abono Transferencia ${destino}`;
    }
  });

  document.getElementById("form-add-abono").addEventListener("submit", (e) => {
    e.preventDefault();
    const deptoId = document.getElementById("abono-depto-id").value;
    const tipo = document.getElementById("abono-tipo").value;
    const monto = parseFloat(document.getElementById("abono-monto").value);
    const fecha = document.getElementById("abono-fecha").value;
    const mes = fecha.substring(0, 7); // Derivar de la fecha de pago automáticamente
    const destino = tipo === "abono" ? document.getElementById("abono-destino").value : "";
    const concepto = document.getElementById("abono-concepto").value.trim();

    if (isNaN(monto) || monto <= 0) {
      showToast("Monto inválido", `El ${tipo} debe ser mayor a cero`, "error");
      return;
    }

    const transactions = DB.getTransactions();
    transactions.push({
      id: `${tipo === 'abono' ? 'M' : 'MC'}-${deptoId}-${fecha}-${Math.floor(Math.random() * 10000)}`,
      deptoId: deptoId,
      fecha: fecha,
      tipo: tipo,
      concepto: concepto,
      mesCorrespondiente: mes,
      destinoAbono: destino || null,
      monto: monto
    });

    DB.saveTransactions(transactions);
    showToast(
      tipo === "abono" ? "Abono registrado" : "Cargo registrado", 
      `${tipo === "abono" ? "Pago" : "Cargo"} de ${formatCurrency(monto)} registrado correctamente a ${deptoId}.`, 
      "success"
    );
    closeAbonoModal();
    renderDeptoDetailView();
  });

  // Detalle depto - Generar PDF Estado de cuenta
  document.getElementById("btn-download-pdf").addEventListener("click", () => generateAnnualPDFReport(null, null));

// --- GENERADOR DE RECIBO INDIVIDUAL PDF ---
function generateReceiptPDF(txId, dept) {
  const transactions = DB.getTransactions();
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a5"); // A5 para recibos
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 40;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("Jardines de Allende", pageWidth / 2, cursorY, { align: "center" });
  
  cursorY += 20;
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(tx.tipo === "abono" ? "RECIBO DE PAGO" : "NOTA DE CARGO", pageWidth / 2, cursorY, { align: "center" });

  cursorY += 40;
  
  // Info
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Propiedad: ${dept.torre} - ${dept.numero} (${dept.id})`, 40, cursorY);
  cursorY += 20;
  doc.text(`Fecha de Transacción: ${tx.fecha}`, 40, cursorY);
  cursorY += 20;
  doc.text(`ID de Transacción: ${tx.id}`, 40, cursorY);
  cursorY += 20;
  doc.text(`Periodo: ${tx.mesCorrespondiente}`, 40, cursorY);
  
  cursorY += 30;
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(40, cursorY, pageWidth - 40, cursorY);
  cursorY += 20;

  // Detalles de Monto y Concepto
  doc.setFont("helvetica", "bold");
  doc.text("Concepto:", 40, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(tx.concepto, 100, cursorY);
  
  cursorY += 30;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Importe Total:", 40, cursorY);
  const color = tx.tipo === "abono" ? [16, 185, 129] : [239, 68, 68]; // Emerald o Red
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(formatCurrency(tx.monto), pageWidth - 40, cursorY, { align: "right" });

  // Guardar y descargar
  doc.save(`Recibo_${tx.tipo}_${tx.id}.pdf`);
  showToast("Recibo Generado", "El recibo PDF ha sido descargado", "success");
}

  // 5. Lecturas de Agua - Guardar lecturas
  document.getElementById("btn-save-water-readings").addEventListener("click", saveWaterReadings);
  
  // Recargar lecturas de agua cuando se cambia periodo, precio o limite base
  document.getElementById("water-period-select").addEventListener("change", renderWaterReadingsView);
  document.getElementById("water-price-input").addEventListener("change", renderWaterReadingsView);
  document.getElementById("water-limit-input").addEventListener("change", renderWaterReadingsView);

  // 6. Importar Excel - Descargar plantilla de ejemplo
  document.getElementById("btn-download-template").addEventListener("click", downloadExcelTemplate);

  // Drag and drop events
  const dropZone = document.getElementById("excel-drop-zone");
  const fileInput = document.getElementById("excel-file-input");

  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleExcelFileSelect(file);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    handleExcelFileSelect(file);
  });

  // Limpiar archivo importado
  document.getElementById("btn-clear-import").addEventListener("click", resetImportState);

  // Aplicar datos del Excel
  document.getElementById("btn-apply-import").addEventListener("click", applyImportedData);

  // --- LISTENERS DE NUEVAS VISTAS Y DIÁLOGOS ---
  // Filtros Ledger por Fechas
  const btnApplyFilter = document.getElementById("btn-apply-ledger-filter");
  if (btnApplyFilter) btnApplyFilter.addEventListener("click", filterLedgerByDate);
  const btnClearFilter = document.getElementById("btn-clear-ledger-filter");
  if (btnClearFilter) {
    btnClearFilter.addEventListener("click", () => {
      document.getElementById("ledger-filter-from").value = "";
      document.getElementById("ledger-filter-to").value = "";
      filterLedgerByDate();
    });
  }
  const btnExportLedgerExcel = document.getElementById("btn-export-ledger-excel");
  if (btnExportLedgerExcel) {
    btnExportLedgerExcel.addEventListener("click", () => {
      exportLedgerExcel(appState.selectedDeptoId);
    });
  }

  // Estado del Departamento
  const deptoStatusSelect = document.getElementById("depto-status-select");
  if (deptoStatusSelect) {
    deptoStatusSelect.addEventListener("change", (e) => {
      setDeptoStatus(appState.selectedDeptoId, e.target.value);
    });
  }

  // Toggle Vista Compacta
  const btnToggleCompact = document.getElementById("btn-toggle-compact");
  if (btnToggleCompact) btnToggleCompact.addEventListener("click", toggleCondoView);

  // Modal Editar Transacción
  const modalEditTx = document.getElementById("modal-edit-transaction");
  const closeEditTxModal = () => {
    modalEditTx.classList.remove("open");
    appState.editingTxId = null;
  };
  const btnCloseEditTx = document.getElementById("btn-close-edit-tx-modal");
  if (btnCloseEditTx) btnCloseEditTx.addEventListener("click", closeEditTxModal);
  const btnCancelEditTx = document.getElementById("btn-cancel-edit-tx");
  if (btnCancelEditTx) btnCancelEditTx.addEventListener("click", closeEditTxModal);
  const formEditTx = document.getElementById("form-edit-transaction");
  if (formEditTx) {
    formEditTx.addEventListener("submit", (e) => {
      e.preventDefault();
      saveEditedTransaction();
    });
  }

  // Modal Confirmar Eliminación
  const modalConfirmDelete = document.getElementById("modal-confirm-delete");
  const closeDeleteModal = () => {
    modalConfirmDelete.classList.remove("open");
    appState.pendingDeleteTxId = null;
  };
  const btnCloseDelete = document.getElementById("btn-close-delete-modal");
  if (btnCloseDelete) btnCloseDelete.addEventListener("click", closeDeleteModal);
  const btnCancelDelete = document.getElementById("btn-cancel-delete");
  if (btnCancelDelete) btnCancelDelete.addEventListener("click", closeDeleteModal);
  const btnConfirmDelete = document.getElementById("btn-confirm-delete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", () => {
      if (appState.pendingDeleteTxId) {
        deleteTransaction(appState.pendingDeleteTxId);
      }
    });
  }

  // Reportes
  const btnReportPdfIndividual = document.getElementById("btn-report-pdf-individual");
  if (btnReportPdfIndividual) btnReportPdfIndividual.addEventListener("click", generateIndividualPDFFromReports);
  const btnReportGlobalPdf = document.getElementById("btn-report-global-pdf");
  if (btnReportGlobalPdf) {
    btnReportGlobalPdf.addEventListener("click", () => {
      const year = document.getElementById("report-global-year-select").value;
      generateGlobalPDFReport(year);
    });
  }
  const btnReportGlobalExcel = document.getElementById("btn-report-global-excel");
  if (btnReportGlobalExcel) {
    btnReportGlobalExcel.addEventListener("click", () => {
      const year = document.getElementById("report-global-year-select").value;
      exportGlobalExcel(year);
    });
  }
  const btnExportExcelT1 = document.getElementById("btn-export-excel-t1");
  if (btnExportExcelT1) {
    btnExportExcelT1.addEventListener("click", () => {
      const year = document.getElementById("report-global-year-select").value;
      exportTowerExcel("Torre 1", year);
    });
  }
  const btnExportExcelT2 = document.getElementById("btn-export-excel-t2");
  if (btnExportExcelT2) {
    btnExportExcelT2.addEventListener("click", () => {
      const year = document.getElementById("report-global-year-select").value;
      exportTowerExcel("Torre 2", year);
    });
  }
  const btnExportExcelT3 = document.getElementById("btn-export-excel-t3");
  if (btnExportExcelT3) {
    btnExportExcelT3.addEventListener("click", () => {
      const year = document.getElementById("report-global-year-select").value;
      exportTowerExcel("Torre 3", year);
    });
  }

  // Reporte de ingresos por destino
  const btnReportDestinoIncome = document.getElementById("btn-report-destino-income");
  if (btnReportDestinoIncome) {
    btnReportDestinoIncome.addEventListener("click", calculateDestinoIncomeReport);
  }
  const btnExportDestinoExcel = document.getElementById("btn-export-destino-excel");
  if (btnExportDestinoExcel) {
    btnExportDestinoExcel.addEventListener("click", exportDestinoIncomeExcel);
  }

  // Configuración / Backup / Reset
  const btnExportBackup = document.getElementById("btn-export-backup");
  if (btnExportBackup) btnExportBackup.addEventListener("click", exportBackupJSON);
  
  const btnImportBackupTrigger = document.getElementById("btn-import-backup-trigger");
  const backupFileInput = document.getElementById("backup-file-input");
  if (btnImportBackupTrigger && backupFileInput) {
    btnImportBackupTrigger.addEventListener("click", () => backupFileInput.click());
    backupFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importBackupJSON(file);
    });
  }

  const btnResetDbTrigger = document.getElementById("btn-reset-db-trigger");
  const modalConfirmReset = document.getElementById("modal-confirm-reset");
  const confirmResetInput = document.getElementById("confirm-reset-input");
  const btnConfirmReset = document.getElementById("btn-confirm-reset");
  
  const closeResetModal = () => {
    modalConfirmReset.classList.remove("open");
    confirmResetInput.value = "";
    btnConfirmReset.classList.add("disabled");
    btnConfirmReset.setAttribute("disabled", "true");
  };
  
  if (btnResetDbTrigger) {
    btnResetDbTrigger.addEventListener("click", () => {
      modalConfirmReset.classList.add("open");
    });
  }
  const btnCloseResetModal = document.getElementById("btn-close-reset-modal");
  if (btnCloseResetModal) btnCloseResetModal.addEventListener("click", closeResetModal);
  const btnCancelReset = document.getElementById("btn-cancel-reset");
  if (btnCancelReset) btnCancelReset.addEventListener("click", closeResetModal);
  
  if (confirmResetInput) {
    confirmResetInput.addEventListener("input", (e) => {
      if (e.target.value.trim() === "RESETEAR") {
        btnConfirmReset.classList.remove("disabled");
        btnConfirmReset.removeAttribute("disabled");
      } else {
        btnConfirmReset.classList.add("disabled");
        btnConfirmReset.setAttribute("disabled", "true");
      }
    });
  }
  
  if (btnConfirmReset) {
    btnConfirmReset.addEventListener("click", () => {
      if (confirmResetInput.value.trim() === "RESETEAR") {
        resetDatabase();
      }
    });
  }

  // Listeners para Vista Resumida de Saldos
  const chkFilterDeudasConvenio = document.getElementById("chk-filter-deudas-convenio");
  if (chkFilterDeudasConvenio) {
    chkFilterDeudasConvenio.addEventListener("change", () => {
      renderResumenSaldosView();
    });
  }

  const btnPrintResumen = document.getElementById("btn-print-resumen");
  if (btnPrintResumen) {
    btnPrintResumen.addEventListener("click", () => {
      window.print();
    });
  }

  // Cargar listeners de gastos
  initExpensesEventListeners();
}

// --- CREAR Y DESCARGAR PLANTILLA EXCEL ---
function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  
  // 1. Hoja de instrucciones
  const instructionsData = [
    ["SISTEMA DE ADMINISTRACIÓN JARDINES DE ALLENDE HIDALGO"],
    ["PLANTILLA DE IMPORTACIÓN DE PAGOS/ABONOS DE CONDOMINOS"],
    [""],
    ["INSTRUCCIONES DE LLENADO:"],
    ["1. No elimines ni alteres el orden de las columnas en la pestaña 'Abonos'."],
    ["2. Columna 'Torre': Escribe exactamente 'Torre 1', 'Torre 2' o 'Torre 3'."],
    ["3. Columna 'Departamento': Escribe el número del departamento (del 1 al 20 para Torres 1 y 3, del 1 al 18 para Torre 2)."],
    ["   Para los locales comerciales de la Torre 2 escribe exactamente 'Local 1' o 'Local 2'."],
    ["4. Columna 'Fecha': Escribe la fecha del pago (Formato recomendado: AAAA-MM-DD, ej: 2025-04-15)."],
    ["5. Columna 'Concepto': Detalle descriptivo (ej: 'Abono Transferencia Banorte Miguel', 'Abono Efectivo')."],
    ["6. Columna 'Destino Abono': Registra la cuenta bancaria de destino ('Banorte Miguel', 'NU Miguel', 'Cuenta Carlos', 'Carlos no Reportado', 'Ajuste por Acuerdo', 'Efectivo' u 'Otro')."],
    ["7. Columna 'Monto': Registra la cantidad en número (ej: 922.00). Debe ser mayor a 0."],
    [""],
    ["* Una vez completado tu registro, guarda el archivo y arrástralo en el panel de Importación de la App."]
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInst, "Instrucciones");
  
  // Ajustar ancho de columnas de instrucciones
  wsInst['!cols'] = [{ wch: 80 }];

  // 2. Hoja de carga de abonos
  const headers = ["Torre", "Departamento", "Fecha", "Concepto", "Destino Abono", "Monto"];
  const exampleRows = [
    ["Torre 1", "1", "2025-04-10", "Abono Mantenimiento y Agua", "Banorte Miguel", 922.00],
    ["Torre 2", "Local 1", "2025-04-12", "Abono Efectivo", "Efectivo", 922.00],
    ["Torre 2", "12", "2025-04-14", "Abono Transferencia NU Miguel", "NU Miguel", 922.00],
    ["Torre 3", "20", "2025-05-02", "Abono Adelanto", "Cuenta Carlos", 1844.00]
  ];

  const wsAbonos = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);
  XLSX.utils.book_append_sheet(wb, wsAbonos, "Abonos");

  // Ajustar anchos en la hoja de abonos
  wsAbonos['!cols'] = [
    { wch: 12 }, // Torre
    { wch: 15 }, // Departamento
    { wch: 12 }, // Fecha
    { wch: 30 }, // Concepto
    { wch: 20 }, // Destino Abono
    { wch: 12 }  // Monto
  ];

  XLSX.writeFile(wb, "JA_Hidalgo_Plantilla_Abonos.xlsx");
  showToast("Plantilla descargada", "Plantilla de ejemplo guardada en descargas", "info");
}

// --- BITÁCORA DE AUDITORÍA ---
function logAuditEvent(action, entityType, entityId, detail) {
  const logs = DB.getAuditLog();
  const now = new Date();
  logs.unshift({
    timestamp: now.toLocaleString("es-MX"),
    action, // 'INSERT' | 'UPDATE' | 'DELETE' | 'RESET' | 'BACKUP'
    entityType, // 'depto' | 'transaction' | 'water_reading' | 'database'
    entityId,
    detail,
    user: "Administrador"
  });
  DB.saveAuditLog(logs);
}

// --- VISTA DE REPORTES ---
function renderReportsView() {
  const towerSelect = document.getElementById("report-tower-select");
  
  populateDeptoSelectByTower(towerSelect.value);
  
  towerSelect.onchange = (e) => {
    populateDeptoSelectByTower(e.target.value);
  };
  
  const deptoSelect = document.getElementById("report-depto-select");
  const yearSelect = document.getElementById("report-year-select");
  
  deptoSelect.onchange = () => previewReportSummary(deptoSelect.value, yearSelect.value);
  yearSelect.onchange = () => previewReportSummary(deptoSelect.value, yearSelect.value);
  
  if (deptoSelect.value) {
    previewReportSummary(deptoSelect.value, yearSelect.value);
  }
}

function populateDeptoSelectByTower(tower) {
  const depts = DB.getDepartments();
  const filtered = depts.filter(d => d.torre === tower);
  const select = document.getElementById("report-depto-select");
  select.innerHTML = "";
  filtered.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = `${d.id} - ${d.contactoNombre || 'Sin Registrar'}`;
    select.appendChild(opt);
  });
  
  const yearSelect = document.getElementById("report-year-select");
  if (select.value) {
    previewReportSummary(select.value, yearSelect.value);
  }
}

function previewReportSummary(deptoId, year) {
  const transactions = DB.getTransactions();
  const yearTx = transactions.filter(t => t.deptoId === deptoId && t.fecha.startsWith(year));
  
  let balance = 0;
  transactions.forEach(t => {
    if (t.deptoId === deptoId && t.fecha < `${parseInt(year) + 1}-01-01`) {
      if (t.tipo === "abono") balance += t.monto;
      else if (t.tipo === "cargo") balance -= t.monto;
    }
  });
  
  document.getElementById("report-preview-tx-count").textContent = yearTx.length;
  const balanceEl = document.getElementById("report-preview-balance");
  balanceEl.textContent = balance < 0 ? `-${formatCurrency(Math.abs(balance))}` : formatCurrency(balance);
  balanceEl.className = `preview-value-highlight ${balance < 0 ? 'text-red' : 'text-emerald'}`;
}

function generateIndividualPDFFromReports() {
  const deptoId = document.getElementById("report-depto-select").value;
  const year = document.getElementById("report-year-select").value;
  if (!deptoId) {
    showToast("Error", "Seleccione un departamento", "error");
    return;
  }
  generateAnnualPDFReport(deptoId, year);
}

// --- AUXILIAR DE PÁGINA PDF POR DEPTO (PARA REPORTE GLOBAL) ---
function renderDeptoPDFPage(doc, dept, year, transactions) {
  const colorEmerald = [6, 78, 59];
  
  let initialBalance = 0;
  const priorYearLimit = `${year}-01-01`;

  transactions.forEach(t => {
    if (t.deptoId === dept.id && t.fecha < priorYearLimit) {
      if (t.tipo === "abono") initialBalance += t.monto;
      else if (t.tipo === "cargo") initialBalance -= t.monto;
    }
  });

  const yearTransactions = transactions.filter(t => 
    t.deptoId === dept.id && 
    t.fecha.startsWith(year)
  );

  yearTransactions.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    if (a.tipo !== b.tipo) return a.tipo === 'cargo' ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  const tableData = [];
  let runningBalance = initialBalance;

  tableData.push([
    "Saldo Inicial Acumulado",
    `Al 1 de Ene ${year}`,
    "-",
    "-",
    "-",
    (runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance))
  ]);

  yearTransactions.forEach(t => {
    const isAbono = t.tipo === "abono";
    if (isAbono) runningBalance += t.monto;
    else runningBalance -= t.monto;

    tableData.push([
      t.concepto,
      t.fecha,
      t.destinoAbono || "-",
      !isAbono ? formatCurrency(t.monto) : "-",
      isAbono ? formatCurrency(t.monto) : "-",
      (runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance))
    ]);
  });

  // CABECERA
  // Dibujar imagen del logo
  const logoImg = document.getElementById("app-logo");
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", 40, 35, 40, 40);
    } catch (e) {
      console.warn("No se pudo cargar la imagen del logo en el PDF:", e);
    }
  }

  doc.setTextColor(6, 78, 59); // Verde esmeralda oscuro
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Jardines de Allende Hidalgo", 95, 52);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text("ADMINISTRACIÓN DE CONDOMINIO", 95, 68);

  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Gris azulado / Slate
  doc.text(`Fecha Reporte: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 430, 52);
  doc.text(`Año de consulta: ${year}`, 430, 68);

  // Línea divisora de cabecera
  doc.setDrawColor(217, 119, 6); // Oro / Dorado
  doc.setLineWidth(1.5);
  doc.line(40, 95, 555, 95);

  // FICHA TÉCNICA
  doc.setFillColor(248, 250, 252);
  doc.rect(40, 130, 515, 90, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 130, 515, 90, "S");

  doc.setTextColor(50, 50, 50);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DATOS DE LA PROPIEDAD", 50, 148);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Propiedad: ${dept.torre} - Depto/Local ${dept.numero} (${dept.id})`, 50, 168);
  doc.text(`Contacto: ${dept.contactoNombre || 'Sin Registrar'} (${dept.contactoRol.toUpperCase()})`, 50, 184);
  doc.text(`Celular: ${dept.contactoCelular || 'N/D'}   |   Email: ${dept.contactoEmail || 'N/D'}`, 50, 200);

  // Recuadro del saldo final
  if (runningBalance < 0) doc.setFillColor(254, 242, 242);
  else doc.setFillColor(240, 253, 250);
  
  doc.rect(380, 140, 160, 70, "F");
  
  if (runningBalance < 0) doc.setDrawColor(252, 165, 165);
  else doc.setDrawColor(16, 185, 129);
  doc.rect(380, 140, 160, 70, "S");

  doc.setTextColor(100, 100, 100);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SALDO ACUMULADO FINAL", 395, 158);

  doc.setFontSize(15);
  if (runningBalance < 0) doc.setTextColor(220, 38, 38);
  else doc.setTextColor(16, 185, 129);
  doc.text((runningBalance < 0 ? "-" : "") + formatCurrency(Math.abs(runningBalance)), 395, 182);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(runningBalance < 0 ? "Cuenta con adeudos" : "Al corriente / Saldo a favor", 395, 198);

  // TABLA
  doc.autoTable({
    startY: 240,
    margin: { left: 40, right: 40 },
    head: [["Concepto", "Fecha de Operación", "Destino de Abono", "Cargos ($)", "Abonos ($)", "Saldo ($)"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: colorEmerald,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left"
    },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 100 },
      2: { cellWidth: 75 },
      3: { cellWidth: 60, halign: "right" },
      4: { cellWidth: 60, halign: "right" },
      5: { cellWidth: 60, halign: "right" }
    },
    styles: {
      fontSize: 8,
      cellPadding: 6
    },
    didParseCell: function(data) {
      if (data.column.index === 5) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.startsWith("-")) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      if (data.row.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    }
  });
}

// --- GENERADOR DE PDF GLOBAL ---
function generateGlobalPDFReport(year) {
  showToast("Generando PDF", "Generando reporte global de 60 propiedades. Por favor espere...", "info");
  
  setTimeout(() => {
    const depts = DB.getDepartments();
    const transactions = DB.getTransactions();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");
    
    depts.forEach((dept, index) => {
      if (index > 0) {
        doc.addPage();
      }
      renderDeptoPDFPage(doc, dept, year, transactions);
    });
    
    doc.save(`Reporte_Global_Condominio_${year}.pdf`);
    showToast("Éxito", "Reporte global PDF descargado correctamente.", "success");
    logAuditEvent("BACKUP", "database", "global", `Generó PDF global para el año ${year}`);
  }, 100);
}

// --- EXPORTACIÓN DE EXCEL CON SHEETJS ---
function exportGlobalExcel(year) {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  const wb = XLSX.utils.book_new();
  
  const towers = ["Torre 1", "Torre 2", "Torre 3"];
  
  towers.forEach(tower => {
    const towerDepts = depts.filter(d => d.torre === tower);
    const towerDeptIds = towerDepts.map(d => d.id);
    const towerTransactions = transactions.filter(t => towerDeptIds.includes(t.deptoId) && t.fecha.startsWith(year));
    
    towerTransactions.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.deptoId.localeCompare(b.deptoId));
    
    const excelRows = [
      ["Propiedad", "Propietario/Adm", "Rol", "Fecha", "Concepto", "Mes Corresp.", "Destino Abono", "Cargo", "Abono"]
    ];
    
    towerTransactions.forEach(t => {
      const dept = depts.find(d => d.id === t.deptoId);
      excelRows.push([
        t.deptoId,
        dept ? dept.contactoNombre : "-",
        dept ? dept.contactoRol : "-",
        t.fecha,
        t.concepto,
        formatMonthES(t.mesCorrespondiente),
        t.destinoAbono || "-",
        t.tipo === "cargo" ? t.monto : 0,
        t.tipo === "abono" ? t.monto : 0
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, tower);
  });
  
  XLSX.writeFile(wb, `Reporte_Global_Excel_${year}.xlsx`);
  showToast("Excel Exportado", `Archivo de reporte global para el año ${year} descargado.`, "success");
  logAuditEvent("BACKUP", "database", "global", `Exportó base de datos Excel del año ${year}`);
}

function exportTowerExcel(tower, year) {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  const wb = XLSX.utils.book_new();
  
  const towerDepts = depts.filter(d => d.torre === tower);
  const towerDeptIds = towerDepts.map(d => d.id);
  const towerTransactions = transactions.filter(t => towerDeptIds.includes(t.deptoId) && t.fecha.startsWith(year));
  
  towerTransactions.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.deptoId.localeCompare(b.deptoId));
  
  const excelRows = [
    ["Propiedad", "Propietario/Adm", "Rol", "Fecha", "Concepto", "Mes Corresp.", "Destino Abono", "Cargo", "Abono"]
  ];
  
  towerTransactions.forEach(t => {
    const dept = depts.find(d => d.id === t.deptoId);
    excelRows.push([
      t.deptoId,
      dept ? dept.contactoNombre : "-",
      dept ? dept.contactoRol : "-",
      t.fecha,
      t.concepto,
      formatMonthES(t.mesCorrespondiente),
      t.destinoAbono || "-",
      t.tipo === "cargo" ? t.monto : 0,
      t.tipo === "abono" ? t.monto : 0
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, tower);
  
  XLSX.writeFile(wb, `Reporte_${tower.replace(" ", "_")}_${year}.xlsx`);
  showToast("Excel Exportado", `Reporte de ${tower} para el año ${year} descargado.`, "success");
  logAuditEvent("BACKUP", "database", tower, `Exportó Excel para ${tower} del año ${year}`);
}

function exportLedgerExcel(deptoId) {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  const dept = depts.find(d => d.id === deptoId);
  if (!dept) return;
  
  const deptoTransactions = transactions.filter(t => t.deptoId === deptoId);
  deptoTransactions.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    if (a.tipo !== b.tipo) return a.tipo === 'cargo' ? -1 : 1;
    return a.id.localeCompare(b.id);
  });
  
  const wb = XLSX.utils.book_new();
  const excelRows = [
    ["Fecha", "Concepto", "Mes Correspondiente", "Destino / Banco", "Cargo", "Abono", "Saldo Acumulado"]
  ];
  
  let runningBalance = 0;
  deptoTransactions.forEach(t => {
    if (t.tipo === "abono") runningBalance += t.monto;
    else if (t.tipo === "cargo") runningBalance -= t.monto;
    
    excelRows.push([
      t.fecha,
      t.concepto,
      formatMonthES(t.mesCorrespondiente),
      t.destinoAbono || "-",
      t.tipo === "cargo" ? t.monto : 0,
      t.tipo === "abono" ? t.monto : 0,
      runningBalance
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, "Ledger");
  
  XLSX.writeFile(wb, `Ledger_${deptoId}.xlsx`);
  showToast("Excel Exportado", `Ledger individual de ${deptoId} descargado.`, "success");
  logAuditEvent("BACKUP", "depto", deptoId, `Exportó ledger individual a Excel`);
}

// --- MÉTRICAS DE TORRES EN DASHBOARD ---
function renderTowerSummaries() {
  const depts = DB.getDepartments();
  const transactions = DB.getTransactions();
  const container = document.getElementById("dashboard-tower-summaries");
  if (!container) return;
  
  container.innerHTML = "";
  
  const towers = ["Torre 1", "Torre 2", "Torre 3"];
  towers.forEach(tower => {
    const towerDepts = depts.filter(d => d.torre === tower);
    const towerDeptIds = towerDepts.map(d => d.id);
    
    let charged = 0;
    let collected = 0;
    
    transactions.forEach(t => {
      if (towerDeptIds.includes(t.deptoId)) {
        if (t.tipo === "cargo") charged += t.monto;
        else if (t.tipo === "abono") collected += t.monto;
      }
    });
    
    const rate = charged > 0 ? (collected / charged) * 100 : 100;
    
    const card = document.createElement("div");
    card.className = "tower-summary-card glass-card";
    card.innerHTML = `
      <div class="tower-summary-header">
        <span class="tower-title">${tower}</span>
        <span class="tab-badge" style="background: rgba(217, 119, 6, 0.15); color: var(--gold-primary);">${rate.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width: ${rate}%;"></div>
      </div>
      <div class="tower-metrics-row" style="margin-top: 6px;">
        <span>Cargado: <strong>${formatCurrency(charged)}</strong></span>
        <span>Cobrado: <strong>${formatCurrency(collected)}</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- VISTA COMPACTA / TARJETAS ---
function toggleCondoView() {
  appState.isCompactView = !appState.isCompactView;
  
  const btn = document.getElementById("btn-toggle-compact");
  const txt = document.getElementById("txt-toggle-compact");
  const icon = btn.querySelector("i");
  
  if (appState.isCompactView) {
    txt.textContent = "Vista Detallada";
    icon.setAttribute("data-lucide", "layout-list");
  } else {
    txt.textContent = "Vista Compacta";
    icon.setAttribute("data-lucide", "layout-grid");
  }
  lucide.createIcons();
  
  renderCondominio();
}

function filterLedgerByDate() {
  renderDeptoDetailView();
}

// --- ACCIONES LEDGER (EDITAR / ELIMINAR) ---
function confirmDeleteTransaction(txId) {
  const transactions = DB.getTransactions();
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;
  
  appState.pendingDeleteTxId = txId;
  
  document.getElementById("delete-tx-concept").textContent = tx.concepto;
  document.getElementById("delete-tx-amount").textContent = formatCurrency(tx.monto);
  
  document.getElementById("modal-confirm-delete").classList.add("open");
}

function deleteTransaction(txId) {
  const transactions = DB.getTransactions();
  const idx = transactions.findIndex(t => t.id === txId);
  if (idx >= 0) {
    const tx = transactions[idx];
    transactions.splice(idx, 1);
    DB.saveTransactions(transactions);
    
    logAuditEvent("DELETE", "transaction", tx.deptoId, `Eliminó transacción: ${tx.concepto} por ${formatCurrency(tx.monto)}`);
    showToast("Transacción eliminada", "La transacción ha sido eliminada del ledger.", "success");
    
    document.getElementById("modal-confirm-delete").classList.remove("open");
    appState.pendingDeleteTxId = null;
    renderDeptoDetailView();
  }
}

function openEditTransactionModal(txId) {
  const transactions = DB.getTransactions();
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;
  
  appState.editingTxId = txId;
  
  document.getElementById("modal-edit-tx-id").textContent = txId;
  document.getElementById("edit-tx-id").value = txId;
  document.getElementById("edit-tx-monto").value = tx.monto;
  document.getElementById("edit-tx-fecha").value = tx.fecha;
  
  const destinoGroup = document.getElementById("group-edit-tx-destino");
  if (tx.tipo === "abono") {
    destinoGroup.style.display = "block";
    document.getElementById("edit-tx-destino").value = tx.destinoAbono || "Banorte Miguel";
  } else {
    destinoGroup.style.display = "none";
    document.getElementById("edit-tx-destino").value = "";
  }
  
  document.getElementById("edit-tx-concepto").value = tx.concepto;
  
  document.getElementById("modal-edit-transaction").classList.add("open");
}

function saveEditedTransaction() {
  const txId = document.getElementById("edit-tx-id").value;
  const monto = parseFloat(document.getElementById("edit-tx-monto").value);
  const fecha = document.getElementById("edit-tx-fecha").value;
  const mes = fecha.substring(0, 7); // Derivado automáticamente
  const destino = document.getElementById("edit-tx-destino").value;
  const concepto = document.getElementById("edit-tx-concepto").value.trim();
  
  if (isNaN(monto) || monto <= 0) {
    showToast("Error", "Monto debe ser positivo", "error");
    return;
  }
  
  const transactions = DB.getTransactions();
  const idx = transactions.findIndex(t => t.id === txId);
  if (idx >= 0) {
    const oldTx = transactions[idx];
    
    transactions[idx].monto = monto;
    transactions[idx].fecha = fecha;
    transactions[idx].mesCorrespondiente = mes;
    transactions[idx].concepto = concepto;
    if (oldTx.tipo === "abono") {
      transactions[idx].destinoAbono = destino || null;
    }
    
    DB.saveTransactions(transactions);
    logAuditEvent("UPDATE", "transaction", oldTx.deptoId, `Editó transacción de ${formatCurrency(oldTx.monto)} a ${formatCurrency(monto)} (${concepto})`);
    showToast("Transacción guardada", "Los cambios han sido guardados correctamente.", "success");
    
    document.getElementById("modal-edit-transaction").classList.remove("open");
    appState.editingTxId = null;
    renderDeptoDetailView();
  }
}

function setDeptoStatus(deptoId, status) {
  const depts = DB.getDepartments();
  const idx = depts.findIndex(d => d.id === deptoId);
  if (idx >= 0) {
    const oldStatus = depts[idx].status || "normal";
    depts[idx].status = status;
    DB.saveDepartments(depts);
    
    logAuditEvent("UPDATE", "depto", deptoId, `Cambió estado de ${oldStatus} a ${status}`);
    showToast("Estado Actualizado", `El departamento ahora está marcado como ${status}.`, "success");
    
    if (status === "desocupado") {
      showToast("Nota", "No se generarán cuotas de mantenimiento automáticas para los siguientes meses.", "info");
    }
    
    renderDeptoDetailView();
  }
}

// --- GRÁFICO COMPARATIVO DE AGUA Trimestral ---
function renderWaterComparisonChart() {
  const ctx = document.getElementById("waterCompareChart");
  if (!ctx) return;
  
  if (appState.waterChartInstance) {
    appState.waterChartInstance.destroy();
  }
  
  const readings = DB.getWaterReadings();
  const periods = [...new Set(readings.map(r => r.periodo))].sort();
  if (periods.length === 0) {
    periods.push("2026-Q1", "2026-Q2");
  }
  
  const towerData = {
    "Torre 1": Array(periods.length).fill(0),
    "Torre 2": Array(periods.length).fill(0),
    "Torre 3": Array(periods.length).fill(0)
  };
  
  const depts = DB.getDepartments();
  
  readings.forEach(r => {
    const periodIdx = periods.indexOf(r.periodo);
    if (periodIdx >= 0) {
      const dept = depts.find(d => d.id === r.deptoId);
      if (dept && towerData[dept.torre]) {
        const consumption = Math.max(0, r.lecturaFinal - r.lecturaInicial);
        towerData[dept.torre][periodIdx] += consumption;
      }
    }
  });
  
  appState.waterChartInstance = new Chart(ctx.getContext("2d"), {
    type: "bar",
    data: {
      labels: periods,
      datasets: [
        {
          label: "Torre 1",
          data: towerData["Torre 1"],
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          borderColor: "#10b981",
          borderWidth: 1
        },
        {
          label: "Torre 2",
          data: towerData["Torre 2"],
          backgroundColor: "rgba(217, 119, 6, 0.6)",
          borderColor: "#d97706",
          borderWidth: 1
        },
        {
          label: "Torre 3",
          data: towerData["Torre 3"],
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "#3b82f6",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#cbd5e1" }
        }
      },
      scales: {
        x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });
}

// --- CONFIGURACIÓN & RESTABLECIMIENTO ---
function renderConfigView() {
  renderAuditLog();
}

function renderAuditLog() {
  const logs = DB.getAuditLog();
  const body = document.querySelector("#table-audit-log tbody");
  if (!body) return;
  
  body.innerHTML = "";
  if (logs.length === 0) {
    body.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No se registran eventos en la bitácora de auditoría.</td></tr>`;
    return;
  }
  
  logs.forEach(l => {
    let badgeClass = "audit-action-insert";
    if (l.action === "UPDATE") badgeClass = "audit-action-update";
    if (l.action === "DELETE") badgeClass = "audit-action-delete";
    if (l.action === "RESET") badgeClass = "audit-action-delete";
    if (l.action === "BACKUP") badgeClass = "audit-action-update";
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.timestamp}</td>
      <td><span class="audit-action-badge ${badgeClass}">${l.action}</span></td>
      <td><span class="text-gold font-bold">${l.entityId}</span> (${l.entityType})</td>
      <td>${l.detail}</td>
    `;
    body.appendChild(tr);
  });
}

function exportBackupJSON() {
  const backup = {
    ja_departments: DB.getDepartments(),
    ja_transactions: DB.getTransactions(),
    ja_water_readings: DB.getWaterReadings(),
    ja_audit_log: DB.getAuditLog(),
    version: "1.0",
    timestamp: new Date().toISOString()
  };
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Backup_JA_Hidalgo_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  logAuditEvent("BACKUP", "database", "backup_json", "Exportó copia de seguridad de la base de datos en formato JSON");
  showToast("Backup Descargado", "El archivo JSON de copia de seguridad se ha descargado.", "success");
}

function importBackupJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.ja_departments && data.ja_transactions && data.ja_water_readings) {
        localStorage.setItem("ja_departments", JSON.stringify(data.ja_departments));
        localStorage.setItem("ja_transactions", JSON.stringify(data.ja_transactions));
        localStorage.setItem("ja_water_readings", JSON.stringify(data.ja_water_readings));
        if (data.ja_audit_log) {
          localStorage.setItem("ja_audit_log", JSON.stringify(data.ja_audit_log));
        }
        
        logAuditEvent("RESET", "database", "import_json", "Restauró la base de datos desde un archivo de copia de seguridad JSON");
        showToast("Integridad de Datos", "Base de datos restaurada correctamente.", "success");
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showToast("Error de formato", "El archivo cargado no tiene la estructura de base de datos válida.", "error");
      }
    } catch(err) {
      showToast("Error de lectura", "No se pudo leer el archivo de copia de seguridad.", "error");
    }
  };
  reader.readAsText(file);
}

function resetDatabase() {
  window.localDbState = {
    ja_departments: [],
    ja_transactions: [],
    ja_water_readings: [],
    ja_audit_log: []
  };
  
  DB.saveDepartments([]);
  DB.saveTransactions([]);
  DB.saveWaterReadings([]);
  DB.saveAuditLog([]);
  localStorage.removeItem("ja_excel_imported");
  
  showToast("Sistema Restablecido", "La base de datos se ha borrado. La página se recargará para inicializar.", "success");
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// --- SELECTOR DINÁMICO DE PERIODOS DE AGUA ---
function generateWaterPeriodOptions() {
  const select = document.getElementById("water-period-select");
  if (!select) return;
  
  select.innerHTML = "";
  
  const periods = [
    { value: "2025-Q2", text: "Q2 2025 (Abr - Jun)" },
    { value: "2025-Q3", text: "Q3 2025 (Jul - Sep)" },
    { value: "2025-Q4", text: "Q4 2025 (Oct - Dic)" },
    { value: "2026-Q1", text: "Q1 2026 (Ene - Mar)" },
    { value: "2026-Q2", text: "Q2 2026 (Abr - Jun)" },
    { value: "2026-Q3", text: "Q3 2026 (Jul - Sep)" },
    { value: "2026-Q4", text: "Q4 2026 (Oct - Dic)" },
    { value: "2027-Q1", text: "Q1 2027 (Ene - Mar)" },
    { value: "2027-Q2", text: "Q2 2027 (Abr - Jun)" }
  ];
  
  periods.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.value;
    opt.textContent = p.text;
    if (p.value === "2026-Q2") {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// --- ACTUALIZACIÓN DE RELOJ EN TIEMPO REAL ---
function startClock() {
  const clockEl = document.getElementById("current-time");
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("es-MX");
  }, 1000);
}

// --- REPORTES: INGRESOS POR DESTINO ---
function calculateDestinoIncomeReport() {
  const transactions = DB.getTransactions();
  
  const abonos = transactions.filter(t => t.tipo === "abono");
  const destinos = ["Banorte Miguel", "NU Miguel", "Cuenta Carlos", "Carlos no Reportado", "Ajuste por Acuerdo", "Efectivo", "Otro"];
  
  if (abonos.length === 0) {
    showToast("Sin datos", "No hay abonos registrados en el sistema.", "info");
    return;
  }
  
  // Obtener años únicos de las transacciones de tipo abono
  const yearsSet = new Set();
  abonos.forEach(t => {
    const yr = t.fecha.split("-")[0];
    if (yr && yr.length === 4) {
      yearsSet.add(yr);
    }
  });
  
  const years = Array.from(yearsSet).sort();
  const tbody = document.getElementById("destino-income-report-body");
  tbody.innerHTML = "";
  
  const reportData = {
    years: {}
  };
  
  years.forEach(year => {
    const monthlyData = {};
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, "0");
      monthlyData[mStr] = {};
      destinos.forEach(d => {
        monthlyData[mStr][d] = 0;
      });
    }
    
    const yearAbonos = abonos.filter(t => t.fecha.startsWith(year));
    
    yearAbonos.forEach(t => {
      const parts = t.fecha.split("-");
      if (parts.length >= 2) {
        const month = parts[1];
        if (monthlyData[month]) {
          let dest = t.destinoAbono || "Otro";
          if (dest === "BBVA") dest = "Banorte Miguel";
          else if (dest === "Santander") dest = "NU Miguel";
          
          if (monthlyData[month][dest] !== undefined) {
            monthlyData[month][dest] += t.monto;
          } else {
            monthlyData[month]["Otro"] += t.monto;
          }
        }
      }
    });
    
    // Fila cabecera del Ejercicio Fiscal
    const yrHeaderTr = document.createElement("tr");
    yrHeaderTr.style.background = "rgba(217, 119, 6, 0.18)";
    yrHeaderTr.style.fontWeight = "bold";
    yrHeaderTr.style.fontSize = "0.85rem";
    yrHeaderTr.innerHTML = `
      <td colspan="3" style="text-align: center; color: #fff; padding: 8px 0; border-bottom: 1px solid var(--border-glass);">EJERCICIO FISCAL ${year}</td>
    `;
    tbody.appendChild(yrHeaderTr);
    
    let yearTotal = 0;
    const destinyAnnualTotals = {};
    destinos.forEach(d => destinyAnnualTotals[d] = 0);
    
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, "0");
      const data = monthlyData[mStr];
      
      let monthlySubtotal = 0;
      destinos.forEach(d => {
        monthlySubtotal += data[d];
        destinyAnnualTotals[d] += data[d];
      });
      
      if (monthlySubtotal > 0) {
        destinos.forEach(d => {
          if (data[d] > 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${d}</td>
              <td>${MONTHS_ES[mStr]}</td>
              <td class="text-right font-medium">${formatCurrency(data[d])}</td>
            `;
            tbody.appendChild(tr);
          }
        });
        
        const subtotalTr = document.createElement("tr");
        subtotalTr.style.background = "rgba(217, 119, 6, 0.06)";
        subtotalTr.style.fontWeight = "bold";
        subtotalTr.innerHTML = `
          <td colspan="2">Subtotal ${MONTHS_ES[mStr]}</td>
          <td class="text-right text-gold">${formatCurrency(monthlySubtotal)}</td>
        `;
        tbody.appendChild(subtotalTr);
        yearTotal += monthlySubtotal;
      }
    }
    
    // Cabecera Resumen Anual del ejercicio
    const headerTr = document.createElement("tr");
    headerTr.style.background = "rgba(255, 255, 255, 0.03)";
    headerTr.style.fontWeight = "bold";
    headerTr.innerHTML = `
      <td colspan="3" style="text-align: center; color: var(--gold-primary); padding-top: 6px;">Resumen Anual ${year}</td>
    `;
    tbody.appendChild(headerTr);
    
    destinos.forEach(d => {
      if (destinyAnnualTotals[d] > 0) {
        const tr = document.createElement("tr");
        tr.style.fontWeight = "500";
        tr.innerHTML = `
          <td>Total ${d}</td>
          <td>Anual ${year}</td>
          <td class="text-right">${formatCurrency(destinyAnnualTotals[d])}</td>
        `;
        tbody.appendChild(tr);
      }
    });
    
    const grandTotalTr = document.createElement("tr");
    grandTotalTr.style.background = "rgba(16, 185, 129, 0.12)";
    grandTotalTr.style.fontWeight = "bold";
    grandTotalTr.innerHTML = `
      <td colspan="2">TOTAL EJERCICIO FISCAL ${year}</td>
      <td class="text-right text-emerald">${formatCurrency(yearTotal)}</td>
    `;
    tbody.appendChild(grandTotalTr);
    
    // Guardar para la exportación a Excel
    reportData.years[year] = {
      monthlyData,
      destinyAnnualTotals,
      yearTotal
    };
  });
  
  document.getElementById("destino-report-year-lbl").textContent = "Historial Completo";
  document.getElementById("destino-income-report-container").classList.remove("hidden");
  
  appState.destinoReportData = reportData;
  
  showToast("Reporte Calculado", "Historial completo de ingresos por destino calculado con éxito.", "success");
  lucide.createIcons();
}

function exportDestinoIncomeExcel() {
  if (!appState.destinoReportData || !appState.destinoReportData.years) {
    showToast("Error", "Primero debes calcular el reporte", "error");
    return;
  }
  
  const reportData = appState.destinoReportData;
  const destinos = ["Banorte Miguel", "NU Miguel", "Cuenta Carlos", "Carlos no Reportado", "Ajuste por Acuerdo", "Efectivo", "Otro"];
  
  const wb = XLSX.utils.book_new();
  const excelRows = [
    ["REPORTE HISTÓRICO DE INGRESOS POR DESTINO DEL DINERO"],
    [""],
    ["Destino", "Mes / Periodo", "Monto"]
  ];
  
  Object.keys(reportData.years).sort().forEach(year => {
    const { monthlyData, destinyAnnualTotals, yearTotal } = reportData.years[year];
    
    excelRows.push([""]);
    excelRows.push([`--- EJERCICIO FISCAL ${year} ---`]);
    excelRows.push([""]);
    
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, "0");
      const data = monthlyData[mStr];
      
      let monthlySubtotal = 0;
      destinos.forEach(d => {
        monthlySubtotal += data[d];
      });
      
      if (monthlySubtotal > 0) {
        destinos.forEach(d => {
          if (data[d] > 0) {
            excelRows.push([d, `${MONTHS_ES[mStr]} ${year}`, data[d]]);
          }
        });
        excelRows.push([`Subtotal ${MONTHS_ES[mStr]} ${year}`, "", monthlySubtotal]);
        excelRows.push([""]);
      }
    }
    
    excelRows.push([`Resumen Anual ${year}`]);
    destinos.forEach(d => {
      if (destinyAnnualTotals[d] > 0) {
        excelRows.push([`Total ${d}`, `Anual ${year}`, destinyAnnualTotals[d]]);
      }
    });
    excelRows.push([`TOTAL EJERCICIO FISCAL ${year}`, "", yearTotal]);
    excelRows.push([""]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, "Histórico por Destino");
  
  XLSX.writeFile(wb, `Reporte_Historico_Ingresos_Destino.xlsx`);
  showToast("Excel Exportado", "Reporte histórico de ingresos por destino descargado.", "success");
}

function applyCondominoRestrictions() {
  if (window.currentUser && window.currentUser.role === 'condomino') {
    // 1. Hide administrative views from navigation menu
    document.querySelectorAll('.nav-menu a[data-view="agua"]').forEach(el => el.remove());
    document.querySelectorAll('.nav-menu a[data-view="importar"]').forEach(el => el.remove());
    document.querySelectorAll('.nav-menu a[data-view="reportes"]').forEach(el => el.remove());
    document.querySelectorAll('.nav-menu a[data-view="configuracion"]').forEach(el => el.remove());
    
    // 2. Hide comparison chart and tower summaries in dashboard
    const chartCard = document.querySelector('.dashboard-grid');
    if (chartCard) chartCard.style.display = 'none';
    const towerSum = document.querySelector('#dashboard-tower-summaries');
    if (towerSum) towerSum.style.display = 'none';
    
    // 3. Hide add cargo/abono buttons in ledger
    const cargoBtn = document.getElementById('btn-open-cargo-modal');
    if (cargoBtn) cargoBtn.style.display = 'none';
    const abonoBtn = document.getElementById('btn-open-abono-modal');
    if (abonoBtn) abonoBtn.style.display = 'none';
    
    // 4. Hide edit contact details button
    const editContactBtn = document.getElementById('btn-edit-contact');
    if (editContactBtn) editContactBtn.style.display = 'none';
    
    // 5. Hide status select in department detail
    const statusSelect = document.getElementById('depto-status-select');
    if (statusSelect) statusSelect.disabled = true;

    // 6. In ledger table, hide the action columns
    const style = document.createElement('style');
    style.innerHTML = `
      #table-ledger th:last-child,
      #table-ledger td:last-child {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function renderResumenSaldosView() {
  const depts = DB.getAllDepartments();
  const transactions = DB.getAllTransactions();
  const filterOnlyDeudas = document.getElementById("chk-filter-deudas-convenio")?.checked || false;

  // Actualizar fecha
  const resumenFechaEl = document.getElementById("resumen-saldos-fecha");
  if (resumenFechaEl) {
    const today = new Date();
    resumenFechaEl.textContent = today.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Obtener tbody
  const tbody = document.querySelector("#table-resumen-saldos tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  // Calcular saldos y mapear
  let filteredDepts = depts.map(d => {
    const saldo = calculateDeptoBalance(d.id, transactions);
    return {
      ...d,
      saldo: saldo
    };
  });

  if (filterOnlyDeudas) {
    // Mostrar solo los que tengan adeudo (saldo < 0) y que NO estén con convenio (conConvenio === false)
    filteredDepts = filteredDepts.filter(d => d.saldo < 0 && !d.conConvenio);
  }

  // Ordenar por ID de propiedad (torre y luego número)
  filteredDepts.sort((a, b) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });

  if (filteredDepts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 20px;">No hay propiedades registradas o que cumplan con el filtro.</td></tr>`;
    return;
  }

  filteredDepts.forEach(d => {
    // const saldoStr = d.saldo < 0.01 ? `-${formatCurrency(Math.abs(d.saldo))}` : formatCurrency(d.saldo);
    const saldoStr = formatCurrency(d.saldo.toFixed(2));
    const saldoColor = d.saldo.toFixed(2) < 0.0 ? "text-red font-bold" : "text-emerald font-bold";
    const convenioBadge = d.conConvenio 
      ? `<span class="badge" style="background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.7rem; padding: 2px 6px; text-transform: uppercase;">Con Convenio</span>`
      : `<span class="badge" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); font-size: 0.7rem; padding: 2px 6px; text-transform: uppercase;">Sin Convenio</span>`;
      
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-glass)";
    tr.innerHTML = `
      <td style="padding: 12px;"><span class="text-gold font-bold">${d.id}</span></td>
      <td style="padding: 12px; color: #fff;">${d.contactoNombre || "Sin Registrar"}</td>
      <td style="padding: 12px; text-transform: capitalize; color: rgba(255,255,255,0.7);">${d.contactoRol}</td>
      <td style="padding: 12px;">${convenioBadge}</td>
      <td style="padding: 12px; text-align: right;" class="${saldoColor}">${saldoStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderGastosView() {
  const expenses = DB.getExpenses();
  const groups = DB.getExpenseGroups();
  const subgroups = DB.getExpenseSubgroups();
  const transactions = DB.getAllTransactions();
  const destinations = DB.getMoneyDestinations();

  // 1. Calcular KPIs
  let totalExpenses = 0;
  const groupTotals = {};
  
  expenses.forEach(e => {
    totalExpenses += e.monto;
    const groupName = groups.find(g => g.id === e.groupId)?.nombre || "Sin Grupo";
    groupTotals[groupName] = (groupTotals[groupName] || 0) + e.monto;
  });

  // KPI 1: Total Gastos
  const totalAmountEl = document.getElementById("expenses-total-amount");
  if (totalAmountEl) {
    totalAmountEl.textContent = formatCurrency(totalExpenses);
  }

  // KPI 2: Balance Adm. Actual
  const activeDestNames = new Set(
    destinations.filter(d => d.administracionActual).map(d => d.nombre)
  );
  let totalCobradoActual = 0;
  transactions.forEach(t => {
    if (t.tipo === "abono" && activeDestNames.has(t.destinoAbono)) {
      totalCobradoActual += t.monto;
    }
  });

  const netBalance = totalCobradoActual - totalExpenses;
  const netBalanceEl = document.getElementById("expenses-net-balance");
  if (netBalanceEl) {
    netBalanceEl.textContent = netBalance < 0 ? `-${formatCurrency(Math.abs(netBalance))}` : formatCurrency(netBalance);
    netBalanceEl.className = "metric-value " + (netBalance < 0 ? "text-red" : "text-emerald");
  }

  // KPI 3: Categoría Mayor Gasto
  let topCategory = "-";
  let maxAmount = 0;
  Object.keys(groupTotals).forEach(name => {
    if (groupTotals[name] > maxAmount) {
      maxAmount = groupTotals[name];
      topCategory = name;
    }
  });
  const topCategoryEl = document.getElementById("expenses-top-category");
  if (topCategoryEl) {
    topCategoryEl.textContent = topCategory;
  }

  // 2. Render Charts
  renderExpensesCharts(expenses, groups);

  // 3. Render Breakdown Table
  const tbodyBreakdown = document.querySelector("#table-expenses-breakdown tbody");
  if (tbodyBreakdown) {
    tbodyBreakdown.innerHTML = "";
    
    const hierarchy = {};
    expenses.forEach(e => {
      const gName = groups.find(g => g.id === e.groupId)?.nombre || "Sin Grupo";
      const sName = subgroups.find(s => s.id === e.subgroupId)?.nombre || "Sin Subgrupo";
      
      if (!hierarchy[gName]) hierarchy[gName] = { total: 0, subgroups: {} };
      hierarchy[gName].total += e.monto;
      hierarchy[gName].subgroups[sName] = (hierarchy[gName].subgroups[sName] || 0) + e.monto;
    });

    const sortedGroups = Object.keys(hierarchy).sort((a,b) => hierarchy[b].total - hierarchy[a].total);

    if (sortedGroups.length === 0) {
      tbodyBreakdown.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding: 15px;">No hay egresos registrados.</td></tr>`;
    } else {
      sortedGroups.forEach(gName => {
        const gTotal = hierarchy[gName].total;
        const gPct = totalExpenses > 0 ? ((gTotal / totalExpenses) * 100).toFixed(1) : "0.0";
        
        const trGroup = document.createElement("tr");
        trGroup.style.background = "rgba(255, 255, 255, 0.03)";
        trGroup.style.fontWeight = "bold";
        trGroup.innerHTML = `
          <td style="padding: 10px; color: var(--gold-primary);"><i data-lucide="folder" class="inline-icon" style="margin-right: 5px;"></i> ${gName}</td>
          <td style="padding: 10px; color: rgba(255,255,255,0.4);">Todos</td>
          <td style="padding: 10px; text-align: right; color: var(--gold-primary);">${formatCurrency(gTotal)}</td>
          <td style="padding: 10px; text-align: right; color: var(--gold-primary);">${gPct}%</td>
        `;
        tbodyBreakdown.appendChild(trGroup);

        const sNames = Object.keys(hierarchy[gName].subgroups).sort((a,b) => hierarchy[gName].subgroups[b] - hierarchy[gName].subgroups[a]);
        sNames.forEach(sName => {
          const sTotal = hierarchy[gName].subgroups[sName];
          const sPct = totalExpenses > 0 ? ((sTotal / totalExpenses) * 100).toFixed(1) : "0.0";

          const trSub = document.createElement("tr");
          trSub.style.borderBottom = "1px solid var(--border-glass)";
          trSub.innerHTML = `
            <td style="padding: 8px 10px 8px 30px; color: rgba(255,255,255,0.75); font-size: 0.85rem;">${gName}</td>
            <td style="padding: 8px 10px; color: rgba(255,255,255,0.75); font-size: 0.85rem;">${sName}</td>
            <td style="padding: 8px 10px; text-align: right; color: rgba(255,255,255,0.75); font-size: 0.85rem;">${formatCurrency(sTotal)}</td>
            <td style="padding: 8px 10px; text-align: right; color: rgba(255,255,255,0.5); font-size: 0.8rem;">${sPct}%</td>
          `;
          tbodyBreakdown.appendChild(trSub);
        });
      });
    }
  }

  // 4. Populate filters
  populateExpensesListFilters(groups);

  // 5. Hide elements for condomino
  if (window.currentUser && window.currentUser.role === 'condomino') {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }

  lucide.createIcons();
}

function populateExpensesListFilters(groups) {
  const filterGroup = document.getElementById("filter-expenses-group");
  const filterMethod = document.getElementById("filter-expenses-method");

  if (filterGroup && filterGroup.options.length <= 1) {
    groups.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.nombre;
      filterGroup.appendChild(opt);
    });
  }

  if (filterMethod && filterMethod.options.length <= 1) {
    const methods = DB.getPaymentMethods();
    methods.forEach(pm => {
      const opt = document.createElement("option");
      opt.value = pm.id;
      opt.textContent = pm.nombre;
      filterMethod.appendChild(opt);
    });
  }
}

function renderExpensesTableList() {
  const expenses = DB.getExpenses();
  const groups = DB.getExpenseGroups();
  const subgroups = DB.getExpenseSubgroups();
  const methods = DB.getPaymentMethods();

  const searchQuery = document.getElementById("search-expenses")?.value.toLowerCase().trim() || "";
  const filterGroupId = parseInt(document.getElementById("filter-expenses-group")?.value) || 0;
  const filterMethodId = parseInt(document.getElementById("filter-expenses-method")?.value) || 0;

  const tbody = document.querySelector("#table-expenses-list tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let filtered = expenses;

  if (searchQuery) {
    filtered = filtered.filter(e => 
      e.concepto.toLowerCase().includes(searchQuery) || 
      e.proveedor.toLowerCase().includes(searchQuery)
    );
  }

  if (filterGroupId) {
    filtered = filtered.filter(e => e.groupId === filterGroupId);
  }

  if (filterMethodId) {
    filtered = filtered.filter(e => e.paymentMethodId === filterMethodId);
  }

  filtered.sort((a,b) => b.fecha.localeCompare(a.fecha));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 20px;">No hay gastos que coincidan con los filtros.</td></tr>`;
    return;
  }

  filtered.forEach(e => {
    const gName = groups.find(g => g.id === e.groupId)?.nombre || "Sin Grupo";
    const sName = subgroups.find(s => s.id === e.subgroupId)?.nombre || "Sin Subgrupo";
    const pmName = methods.find(pm => pm.id === e.paymentMethodId)?.nombre || "Sin Forma";

    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-glass)";
    
    let supportCell = "";
    if (e.documento) {
      if (e.documento.startsWith("http") || e.documento.includes("/")) {
        supportCell = `<a href="${e.documento}" target="_blank" class="text-gold" style="display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Soporte</a>`;
      } else {
        supportCell = `<span class="text-muted" style="font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="file" style="width: 14px; height: 14px;"></i> ${e.documento}</span>`;
      }
    } else {
      supportCell = `<span class="text-muted" style="font-size: 0.75rem;">Sin soporte</span>`;
    }

    tr.innerHTML = `
      <td style="padding: 10px; font-size: 0.85rem;"><span class="text-muted">${e.id}</span></td>
      <td style="padding: 10px; color: #fff; font-size: 0.85rem; white-space: nowrap;">${e.fecha}</td>
      <td style="padding: 10px; color: #fff; font-weight: 500; font-size: 0.85rem;">${e.concepto}</td>
      <td style="padding: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.75);"><span class="badge" style="background: rgba(255,255,255,0.05);">${gName} / ${sName}</span></td>
      <td style="padding: 10px; color: #fff; font-size: 0.85rem;">${e.proveedor}</td>
      <td style="padding: 10px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">${pmName}</td>
      <td style="padding: 10px; text-align: right; font-weight: 600;" class="text-red">${formatCurrency(e.monto)}</td>
      <td style="padding: 10px;" class="no-print">${supportCell}</td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function renderExpensesCharts(expenses, groups) {
  const ctxMonthly = document.getElementById("chartExpensesMonthly")?.getContext("2d");
  if (ctxMonthly) {
    if (appState.chartExpensesMonthlyInstance) {
      appState.chartExpensesMonthlyInstance.destroy();
    }

    const dataset = {};
    expenses.forEach(e => {
      const year = e.fecha.substring(0, 4);
      const month = e.fecha.substring(5, 7);
      
      if (!dataset[year]) {
        dataset[year] = Array(12).fill(0);
      }
      const mIdx = parseInt(month) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        dataset[year][mIdx] += e.monto;
      }
    });

    const years = Object.keys(dataset).sort();
    
    const colors = [
      { border: "#e11d48", bg: "rgba(225, 29, 72, 0.3)" },
      { border: "#d97706", bg: "rgba(217, 119, 6, 0.3)" },
      { border: "#2563eb", bg: "rgba(37, 99, 235, 0.3)" },
      { border: "#059669", bg: "rgba(5, 150, 105, 0.3)" }
    ];

    const chartDatasets = years.map((yr, idx) => {
      const color = colors[idx % colors.length];
      return {
        label: yr,
        data: dataset[yr],
        borderColor: color.border,
        backgroundColor: color.bg,
        borderWidth: 2,
        borderRadius: 4
      };
    });

    appState.chartExpensesMonthlyInstance = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        datasets: chartDatasets.length > 0 ? chartDatasets : [{ label: "Sin Datos", data: Array(12).fill(0), borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)" }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "rgba(255,255,255,0.7)", font: { family: "Outfit" } } }
        },
        scales: {
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(255,255,255,0.5)", font: { family: "Outfit" } } },
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(255,255,255,0.5)", font: { family: "Outfit" } } }
        }
      }
    });
  }

  const ctxGroup = document.getElementById("chartExpensesGroup")?.getContext("2d");
  if (ctxGroup) {
    if (appState.chartExpensesGroupInstance) {
      appState.chartExpensesGroupInstance.destroy();
    }

    const groupSums = {};
    expenses.forEach(e => {
      const gName = groups.find(g => g.id === e.groupId)?.nombre || "Sin Grupo";
      groupSums[gName] = (groupSums[gName] || 0) + e.monto;
    });

    const labels = Object.keys(groupSums);
    const data = Object.values(groupSums);

    const colors = [
      "#f43f5e", "#3b82f6", "#eab308", "#10b981", "#a855f7", "#f97316"
    ];

    appState.chartExpensesGroupInstance = new Chart(ctxGroup, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ["Sin Egresos"],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: data.length > 0 ? colors.slice(0, labels.length) : ["rgba(255,255,255,0.1)"],
          borderColor: "rgba(0, 0, 0, 0.4)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function initExpensesEventListeners() {
  const btnReports = document.getElementById("btn-gastos-tab-reports");
  const btnList = document.getElementById("btn-gastos-tab-list");
  const subviewReports = document.getElementById("gastos-subview-reports");
  const subviewList = document.getElementById("gastos-subview-list");

  if (btnReports && btnList && subviewReports && subviewList) {
    btnReports.addEventListener("click", () => {
      btnReports.classList.add("active");
      btnList.classList.remove("active");
      subviewReports.style.display = "grid";
      subviewList.style.display = "none";
    });
    btnList.addEventListener("click", () => {
      btnList.classList.add("active");
      btnReports.classList.remove("active");
      subviewList.style.display = "block";
      subviewReports.style.display = "none";
      renderExpensesTableList();
    });
  }

  const modalAdd = document.getElementById("modal-add-expense");
  const btnOpenAdd = document.getElementById("btn-open-add-gasto");
  const btnCloseAddHeader = document.getElementById("btn-close-add-expense-modal");
  const btnCloseAddCancel = document.getElementById("btn-cancel-add-expense");

  if (btnOpenAdd && modalAdd) {
    btnOpenAdd.addEventListener("click", () => {
      modalAdd.classList.add("open");
      populateAddExpenseModalSelects();
    });
  }
  [btnCloseAddHeader, btnCloseAddCancel].forEach(b => {
    b?.addEventListener("click", () => {
      modalAdd?.classList.remove("open");
      document.getElementById("form-add-expense")?.reset();
    });
  });

  const modalImport = document.getElementById("modal-import-expenses");
  const btnOpenImport = document.getElementById("btn-open-import-gastos");
  const btnCloseImportHeader = document.getElementById("btn-close-import-expenses-modal");
  const btnCloseImportCancel = document.getElementById("btn-cancel-import-expenses");

  if (btnOpenImport && modalImport) {
    btnOpenImport.addEventListener("click", () => {
      modalImport.classList.add("open");
    });
  }
  [btnCloseImportHeader, btnCloseImportCancel].forEach(b => {
    b?.addEventListener("click", () => {
      modalImport?.classList.remove("open");
      resetExpensesImportState();
    });
  });

  const selectGroup = document.getElementById("add-expense-group");
  const selectSubgroup = document.getElementById("add-expense-subgroup");
  if (selectGroup && selectSubgroup) {
    selectGroup.addEventListener("change", (e) => {
      const groupId = parseInt(e.target.value);
      selectSubgroup.innerHTML = '<option value="">Selecciona subgrupo</option>';
      if (!groupId) return;
      const subgroups = DB.getExpenseSubgroups().filter(s => s.groupId === groupId);
      subgroups.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.nombre;
        selectSubgroup.appendChild(opt);
      });
    });
  }

  const formAddExpense = document.getElementById("form-add-expense");
  if (formAddExpense) {
    formAddExpense.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const concept = document.getElementById("add-expense-concept").value;
      const date = document.getElementById("add-expense-date").value;
      const amount = parseFloat(document.getElementById("add-expense-amount").value);
      const groupId = parseInt(document.getElementById("add-expense-group").value);
      const subgroupId = parseInt(document.getElementById("add-expense-subgroup").value);
      const provider = document.getElementById("add-expense-provider").value;
      const paymentMethodId = parseInt(document.getElementById("add-expense-payment-method").value);
      const docVal = document.getElementById("add-expense-doc").value;

      const newExpense = {
        id: 'EXP-' + String(Date.now()),
        fecha: date,
        monto: amount,
        concepto: concept,
        groupId: groupId,
        subgroupId: subgroupId,
        proveedor: provider,
        paymentMethodId: paymentMethodId,
        documento: docVal ? docVal : null
      };

      const expenses = DB.getExpenses();
      expenses.push(newExpense);
      DB.saveExpenses(expenses);

      logAuditEvent("CREAR_GASTO", "Expense", newExpense.id, `Gasto manual registrado: ${concept} por $${amount}`);

      showToast("Gasto Registrado", "El egreso se guardó correctamente.", "success");
      modalAdd.classList.remove("open");
      formAddExpense.reset();

      renderGastosView();
    });
  }

  const searchInput = document.getElementById("search-expenses");
  const filterGroup = document.getElementById("filter-expenses-group");
  const filterMethod = document.getElementById("filter-expenses-method");

  [searchInput, filterGroup, filterMethod].forEach(el => {
    el?.addEventListener("input", () => {
      renderExpensesTableList();
    });
    el?.addEventListener("change", () => {
      renderExpensesTableList();
    });
  });

  const dropzone = document.getElementById("expenses-dropzone");
  const fileInput = document.getElementById("expenses-excel-input");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--gold-primary)";
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.style.borderColor = "var(--border-glass)";
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--border-glass)";
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleExpensesExcelFile(files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleExpensesExcelFile(e.target.files[0]);
      }
    });
  }

  const btnDownloadTemplate = document.getElementById("btn-download-expenses-template");
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener("click", () => {
      downloadExpensesExcelTemplate();
    });
  }

  const btnConfirmImport = document.getElementById("btn-confirm-import-expenses");
  if (btnConfirmImport) {
    btnConfirmImport.addEventListener("click", () => {
      applyImportedExpensesData();
    });
  }
}

function populateAddExpenseModalSelects() {
  const selectGroup = document.getElementById("add-expense-group");
  const selectMethod = document.getElementById("add-expense-payment-method");
  
  if (selectGroup) {
    selectGroup.innerHTML = '<option value="">Selecciona grupo</option>';
    DB.getExpenseGroups().forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.nombre;
      selectGroup.appendChild(opt);
    });
  }

  if (selectMethod) {
    selectMethod.innerHTML = '<option value="">Selecciona forma</option>';
    DB.getPaymentMethods().forEach(pm => {
      const opt = document.createElement("option");
      opt.value = pm.id;
      opt.textContent = pm.nombre;
      selectMethod.appendChild(opt);
    });
  }
}

function downloadExpensesExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const instructionsData = [
    ["JARDINES DE ALLENDE HIDALGO - PLANTILLA DE IMPORTACIÓN DE EGRESOS"],
    [""],
    ["INSTRUCCIONES IMPORTANTES:"],
    ["1. Llena los datos en la hoja 'Egresos' a partir de la fila 2."],
    ["2. No alteres las cabeceras ni el orden de las columnas."],
    ["3. El formato de la fecha debe ser AAAA-MM-DD (ej: 2026-06-25) o tipo Fecha en Excel."],
    ["4. El monto debe ser numérico positivo."],
    ["5. Las columnas 'Grupo', 'Subgrupo' y 'Forma de Pago' son obligatorias. Si introduces nombres nuevos,"],
    ["   se crearán automáticamente en el sistema al aplicar la importación."],
    [""],
    ["EJEMPLO DE REGISTRO EN HOJA 'Egresos':"],
    ["Fecha", "Monto", "Concepto", "Grupo", "Subgrupo", "Proveedor", "Forma de Pago"],
    ["2026-06-01", 1500.00, "Servicio de Limpieza", "Mantenimiento General", "Jardinería y Limpieza", "Limpieza SA", "Transferencia Bancaria"],
    ["2026-06-02", 450.50, "Papelería Caseta", "Administración y Operación", "Papelería e Impresiones", "Ofix SA", "Efectivo"]
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInst, "Instrucciones");

  const headers = [
    ["Fecha", "Monto", "Concepto", "Grupo", "Subgrupo", "Proveedor", "Forma de Pago"]
  ];
  const wsEgresos = XLSX.utils.aoa_to_sheet(headers);
  
  wsEgresos['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 35 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 }
  ];
  
  XLSX.utils.book_append_sheet(wb, wsEgresos, "Egresos");

  XLSX.writeFile(wb, "plantilla_importacion_egresos.xlsx");
}

function handleExpensesExcelFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const sheetName = workbook.SheetNames.includes("Egresos") ? "Egresos" : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      if (rows.length === 0) {
        showToast("Error de Importación", "El archivo Excel está vacío.", "error");
        return;
      }

      validateAndPreviewExpensesExcelData(rows);
      
    } catch(err) {
      console.error(err);
      showToast("Error de Importación", "No se pudo leer el archivo Excel.", "error");
    }
  };

  reader.readAsArrayBuffer(file);
}

function validateAndPreviewExpensesExcelData(rows) {
  const previewBody = document.querySelector("#table-expenses-import-preview tbody");
  if (!previewBody) return;
  previewBody.innerHTML = "";

  const validRows = [];
  let invalidCount = 0;

  rows.forEach((row, index) => {
    const normalized = {};
    Object.keys(row).forEach(k => {
      normalized[k.trim().toLowerCase()] = row[k];
    });

    const excelFecha = normalized["fecha"] || normalized["date"] || "";
    const excelMonto = normalized["monto"] || normalized["amount"] || "";
    const excelConcepto = normalized["concepto"] || normalized["concept"] || "";
    const excelGrupo = normalized["grupo"] || normalized["group"] || "";
    const excelSubgrupo = normalized["subgrupo"] || normalized["subgroup"] || "";
    const excelProveedor = normalized["proveedor"] || normalized["provider"] || "";
    const excelForma = normalized["forma de pago"] || normalized["payment method"] || normalized["forma_pago"] || "";

    let finalFecha = "";
    if (typeof excelFecha === 'number') {
      const d = new Date(Math.round((excelFecha - 25569) * 86400 * 1000));
      finalFecha = d.toISOString().substring(0, 10);
    } else {
      const str = String(excelFecha).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        finalFecha = str;
      } else {
        const matches = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (matches) {
          finalFecha = `${matches[3]}-${matches[2].padStart(2, '0')}-${matches[1].padStart(2, '0')}`;
        }
      }
    }

    const finalMonto = parseFloat(String(excelMonto).replace(/[\$,]/g, ''));

    const errors = [];
    if (!finalFecha) errors.push("Fecha inválida");
    if (isNaN(finalMonto) || finalMonto <= 0) errors.push("Monto debe ser positivo");
    if (!String(excelConcepto).trim()) errors.push("Concepto requerido");
    if (!String(excelGrupo).trim()) errors.push("Grupo requerido");
    if (!String(excelSubgrupo).trim()) errors.push("Subgrupo requerido");
    if (!String(excelProveedor).trim()) errors.push("Proveedor requerido");
    if (!String(excelForma).trim()) errors.push("Forma requerido");

    const isValid = errors.length === 0;

    const tr = document.createElement("tr");
    tr.style.fontSize = "0.8rem";
    tr.style.borderBottom = "1px solid var(--border-glass)";

    const statusBadge = isValid 
      ? `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 6px; font-size: 0.7rem;">Válido</span>`
      : `<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; font-size: 0.7rem;" title="${errors.join(', ')}">Error</span>`;

    tr.innerHTML = `
      <td>${finalFecha || `<span class="text-red">Error</span>`}</td>
      <td class="text-right">${isNaN(finalMonto) ? `<span class="text-red">Error</span>` : formatCurrency(finalMonto)}</td>
      <td>${excelConcepto || `<span class="text-red">Vacío</span>`}</td>
      <td>${excelGrupo || `<span class="text-red">Vacío</span>`}</td>
      <td>${excelSubgrupo || `<span class="text-red">Vacío</span>`}</td>
      <td>${excelProveedor || `<span class="text-red">Vacío</span>`}</td>
      <td>${excelForma || `<span class="text-red">Vacío</span>`}</td>
      <td>${statusBadge}</td>
    `;
    previewBody.appendChild(tr);

    if (isValid) {
      validRows.push({
        fecha: finalFecha,
        monto: finalMonto,
        concepto: String(excelConcepto).trim(),
        grupoNombre: String(excelGrupo).trim(),
        subgrupoNombre: String(excelSubgrupo).trim(),
        proveedor: String(excelProveedor).trim(),
        formaNombre: String(excelForma).trim()
      });
    } else {
      invalidCount++;
    }
  });

  document.getElementById("expenses-import-preview-container").style.display = "block";
  document.getElementById("expenses-import-count").textContent = rows.length;

  const btnConfirm = document.getElementById("btn-confirm-import-expenses");
  if (validRows.length > 0) {
    btnConfirm.classList.remove("disabled");
    btnConfirm.removeAttribute("disabled");
    appState.expensesExcelImportData = validRows;
  } else {
    btnConfirm.classList.add("disabled");
    btnConfirm.setAttribute("disabled", "true");
    appState.expensesExcelImportData = null;
  }

  if (invalidCount > 0) {
    showToast("Validación finalizada", `Se encontraron ${invalidCount} filas con errores en el archivo Excel.`, "warning");
  } else {
    showToast("Validación exitosa", "Todas las filas del Excel son correctas.", "success");
  }
}

async function applyImportedExpensesData() {
  const importedData = appState.expensesExcelImportData;
  if (!importedData || importedData.length === 0) return;

  const currentGroups = [...DB.getExpenseGroups()];
  const currentSubgroups = [...DB.getExpenseSubgroups()];
  const currentMethods = [...DB.getPaymentMethods()];
  const currentExpenses = [...DB.getExpenses()];

  let maxGroupId = currentGroups.reduce((max, g) => g.id > max ? g.id : max, 0);
  let maxSubgroupId = currentSubgroups.reduce((max, s) => s.id > max ? s.id : max, 0);
  let maxMethodId = currentMethods.reduce((max, m) => m.id > max ? m.id : max, 0);

  importedData.forEach(row => {
    let group = currentGroups.find(g => g.nombre.toLowerCase().trim() === row.grupoNombre.toLowerCase().trim());
    if (!group) {
      maxGroupId++;
      group = { id: maxGroupId, nombre: row.grupoNombre };
      currentGroups.push(group);
    }
    row.groupId = group.id;

    let subgroup = currentSubgroups.find(s => s.groupId === group.id && s.nombre.toLowerCase().trim() === row.subgrupoNombre.toLowerCase().trim());
    if (!subgroup) {
      maxSubgroupId++;
      subgroup = { id: maxSubgroupId, groupId: group.id, nombre: row.subgrupoNombre };
      currentSubgroups.push(subgroup);
    }
    row.subgroupId = subgroup.id;

    let method = currentMethods.find(m => m.nombre.toLowerCase().trim() === row.formaNombre.toLowerCase().trim());
    if (!method) {
      maxMethodId++;
      method = { id: maxMethodId, nombre: row.formaNombre };
      currentMethods.push(method);
    }
    row.paymentMethodId = method.id;
  });

  DB.saveExpenseGroups(currentGroups);
  DB.saveExpenseSubgroups(currentSubgroups);
  DB.savePaymentMethods(currentMethods);

  const newExpenses = importedData.map((row, idx) => {
    return {
      id: 'EXP-' + String(Date.now()) + '-' + idx,
      fecha: row.fecha,
      monto: row.monto,
      concepto: row.concepto,
      groupId: row.groupId,
      subgroupId: row.subgroupId,
      proveedor: row.proveedor,
      paymentMethodId: row.paymentMethodId,
      documento: null
    };
  });

  const finalExpensesList = [...currentExpenses, ...newExpenses];
  DB.saveExpenses(finalExpensesList);

  logAuditEvent("IMPORTAR_GASTOS", "Expense", "EXCEL", `Importación de ${newExpenses.length} egresos desde Excel`);

  showToast("Gastos Importados", `Se importaron con éxito ${newExpenses.length} egresos.`, "success");
  
  document.getElementById("modal-import-expenses").classList.remove("open");
  resetExpensesImportState();

  renderGastosView();
}

function resetExpensesImportState() {
  appState.expensesExcelImportData = null;
  document.getElementById("expenses-excel-input").value = "";
  document.getElementById("expenses-import-preview-container").style.display = "none";
  document.querySelector("#table-expenses-import-preview tbody").innerHTML = "";
  
  const btnConfirm = document.getElementById("btn-confirm-import-expenses");
  if (btnConfirm) {
    btnConfirm.classList.add("disabled");
    btnConfirm.setAttribute("disabled", "true");
  }
}

function renderDashboardNotices() {
  const notices = DB.getNotices();
  const todayStr = new Date().toISOString().substring(0, 10);

  const container = document.getElementById("dashboard-notices-container");
  const listEl = document.getElementById("dashboard-notices-list");
  const countEl = document.getElementById("dashboard-notices-count");

  if (!container || !listEl) return;

  // Filtrar avisos activos y vigentes
  const activeNotices = notices.filter(n => {
    if (!n.activo) return false;
    if (n.fechaPublicacion && n.fechaPublicacion > todayStr) return false;
    if (n.fechaVigencia && n.fechaVigencia < todayStr) return false;
    return true;
  });

  if (activeNotices.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  if (countEl) {
    countEl.textContent = `${activeNotices.length} ${activeNotices.length === 1 ? 'aviso vigente' : 'avisos vigentes'}`;
  }

  listEl.innerHTML = "";
  activeNotices.forEach(n => {
    const div = document.createElement("div");
    div.style.background = "rgba(255,255,255,0.02)";
    div.style.border = "1px solid var(--border-glass)";
    div.style.borderRadius = "8px";
    div.style.padding = "12px 16px";
    div.innerHTML = `
      <h5 style="margin: 0 0 5px 0; color: #fff; font-size: 0.9rem; font-weight: 600;">${n.titulo}</h5>
      <p style="margin: 0 0 8px 0; font-size: 0.8rem; color: rgba(255,255,255,0.85); line-height: 1.4;">${n.contenido}</p>
      <span style="font-size: 0.7rem; color: rgba(255,255,255,0.4); display: block;">Publicado el: ${n.fechaPublicacion}</span>
    `;
    listEl.appendChild(div);
  });
}

// --- ARRANQUE DE LA APLICACIÓN (onload) ---
window.addEventListener("DOMContentLoaded", async () => {
  // Load database state from Laravel SQLite database
  try {
    const response = await fetch('/api/db-state');
    window.localDbState = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el estado de la base de datos:", error);
    window.localDbState = {
      ja_departments: [],
      ja_transactions: [],
      ja_water_readings: [],
      ja_audit_log: []
    };
  }

  // Apply condomino limits and navigation hiding
  applyCondominoRestrictions();

  // Inicialización de la Base de Datos
  initDatabase();

  // Generar opciones del periodo de agua
  generateWaterPeriodOptions();

  // Registrar listeners globales de DOM
  initEventListeners();

  // Iniciar reloj
  startClock();

  // Cargar vista inicial (Dashboard)
  navigateTo("dashboard");
});
