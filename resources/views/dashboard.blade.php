<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jardines de Allende Hidalgo - Administración de Condominio</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- SheetJS (xlsx) -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <!-- jsPDF & jsPDF-AutoTable -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Stylesheet and Favicon -->
  <link rel="stylesheet" href="{{ asset('css/index.css') }}">
  <link rel="icon" type="image/png" href="assets/logo_jardines_hidalgo.png">
</head>
<body class="dark-theme">
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="brand">
        <img id="app-logo" src="assets/logo_jardines_hidalgo.png" alt="Logo Jardines de Allende" class="brand-logo" style="width: 35px; height: 35px; object-fit: contain; margin-right: 10px; border-radius: 6px;">
        <div class="brand-text">
          <h1>Jardines de Allende</h1>
          <span>ADMINISTRACIÓN</span>
        </div>
      </div>
      <nav class="nav-menu">
        <a href="#dashboard" class="nav-item active" data-view="dashboard">
          <i data-lucide="layout-dashboard"></i>
          <span>Dashboard</span>
        </a>
        <a href="#condominio" class="nav-item" data-view="condominio">
          <i data-lucide="building-2"></i>
          <span>Condominio</span>
        </a>
        <a href="#agua" class="nav-item" data-view="agua">
          <i data-lucide="droplet"></i>
          <span>Lecturas de Agua</span>
        </a>
        <a href="#importar" class="nav-item" data-view="importar">
          <i data-lucide="file-spreadsheet"></i>
          <span>Importar Excel</span>
        </a>
        <a href="#reportes" class="nav-item" data-view="reportes">
          <i data-lucide="file-bar-chart"></i>
          <span>Reportes</span>
        </a>
        <a href="#configuracion" class="nav-item" data-view="configuracion">
          <i data-lucide="settings"></i>
          <span>Configuración</span>
        </a>
        <a href="{{ url('/admin') }}" class="nav-item" style="color: var(--gold-primary); border-top: 1px solid var(--border-glass); margin-top: 15px; padding-top: 15px;">
          <i data-lucide="shield-check"></i>
          <span>Panel Admin (Principal)</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-profile" style="cursor: pointer;" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" title="Cerrar Sesión">
          <div class="avatar">{{ substr(auth()->user()->name, 0, 2) }}</div>
          <div class="profile-info">
            <p class="profile-name">{{ auth()->user()->name }}</p>
            <p class="profile-role" style="text-transform: uppercase;">{{ auth()->user()->role }} ({{ auth()->user()->department_id ?: 'Admin' }})</p>
            <span style="font-size: 0.65rem; color: #f87171;">Cerrar Sesión</span>
          </div>
        </div>
        <form id="logout-form" action="{{ route('filament.admin.auth.logout') }}" method="POST" class="hidden" style="display:none;">
            @csrf
        </form>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <button class="mobile-toggle-btn">
          <i data-lucide="menu"></i>
        </button>
        <div class="header-title">
          <h2 id="view-title">Dashboard</h2>
          <p id="view-subtitle" class="text-muted">Resumen general de las finanzas del condominio</p>
        </div>
        <div class="header-actions">
          <div class="live-clock">
            <i data-lucide="clock"></i>
            <span id="current-time">--:--:--</span>
          </div>
          <div class="status-badge-container">
            <span class="badge badge-success-glow">
              <span class="indicator-dot"></span> LocalStorage Activo
            </span>
          </div>
        </div>
      </header>

      <!-- View Containers -->
      <div class="view-content">

        <!-- 1. DASHBOARD VIEW -->
        <section id="view-dashboard" class="app-view active-view">
          <!-- Summary Cards -->
          <div class="metrics-grid">
            <div class="metric-card glass-card">
              <div class="metric-icon bg-emerald-light">
                <i data-lucide="trending-up" class="emerald-icon"></i>
              </div>
              <div class="metric-data">
                <h3>Total Cargado</h3>
                <p class="metric-value" id="dashboard-total-charged">$0.00</p>
                <span class="metric-subtext">Cargos fijos + excedentes agua</span>
              </div>
            </div>

            <div class="metric-card glass-card">
              <div class="metric-icon bg-gold-light">
                <i data-lucide="dollar-sign" class="gold-icon"></i>
              </div>
              <div class="metric-data">
                <h3>Total Cobrado</h3>
                <p class="metric-value text-gold" id="dashboard-total-collected">$0.00</p>
                <span class="metric-subtext">Abonos y pagos registrados</span>
              </div>
            </div>

            <div class="metric-card glass-card">
              <div class="metric-icon bg-red-light">
                <i data-lucide="alert-circle" class="red-icon"></i>
              </div>
              <div class="metric-data">
                <h3>Deuda Pendiente</h3>
                <p class="metric-value text-red" id="dashboard-total-debt">$0.00</p>
                <span class="metric-subtext">Saldo neto por cobrar</span>
              </div>
            </div>

            <div class="metric-card glass-card">
              <div class="metric-icon bg-blue-light">
                <i data-lucide="pie-chart" class="blue-icon"></i>
              </div>
              <div class="metric-data">
                <h3>Porcentaje de Cobranza</h3>
                <p class="metric-value text-blue" id="dashboard-collection-rate">0.0%</p>
                <span class="metric-subtext">Cobrado vs. Cargado acumulativo</span>
              </div>
            </div>
          </div>

          <!-- Tower Summaries -->
          <div class="tower-summary-grid" id="dashboard-tower-summaries">
            <!-- Dynamic tower summary cards -->
          </div>

          <!-- Charts and Alerts Grid -->
          <div class="dashboard-grid">
            <!-- Chart Card -->
            <div class="dashboard-card glass-card span-2">
              <div class="card-header">
                <h3>Comparativo de Cargos vs Abonos</h3>
                <p class="card-subtitle">Flujo mensual del periodo de administración</p>
              </div>
              <div class="card-body chart-container">
                <canvas id="financialChart"></canvas>
              </div>
            </div>

            <!-- Top Debts (Morosos) Card -->
            <div class="dashboard-card glass-card">
              <div class="card-header">
                <h3>Departamentos con Mayor Deuda</h3>
                <p class="card-subtitle">Top 5 cuentas pendientes</p>
              </div>
              <div class="card-body">
                <div class="table-container">
                  <table class="dashboard-table" id="table-top-morosos">
                    <thead>
                      <tr>
                        <th>Depto</th>
                        <th>Contacto</th>
                        <th class="text-right">Adeudo</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Dynamic rows -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. CONDOMINIO VIEW -->
        <section id="view-condominio" class="app-view">
          <!-- Filter and Search Bar -->
          <div class="control-panel glass-card">
            <div class="search-box">
              <i data-lucide="search" class="search-icon"></i>
              <input type="text" id="condo-search-input" placeholder="Buscar por departamento, propietario o celular...">
            </div>
            <div class="filter-group">
              <label for="condo-status-filter"><i data-lucide="filter"></i> Estado:</label>
              <select id="condo-status-filter">
                <option value="all">Todos los estados</option>
                <option value="current">Al corriente / A favor</option>
                <option value="debt">Con adeudo</option>
              </select>
            </div>
            <div class="filter-group" style="margin-left: auto;">
              <button class="btn btn-secondary" id="btn-toggle-compact" style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="layout-grid"></i>
                <span id="txt-toggle-compact">Vista Compacta</span>
              </button>
            </div>
          </div>

          <!-- Tower Tabs -->
          <div class="tab-container">
            <div class="tabs">
              <button class="tab-btn active" data-tower="Torre 1">
                <i data-lucide="building"></i> Torre 1 <span class="tab-badge" id="badge-t1">20</span>
              </button>
              <button class="tab-btn" data-tower="Torre 2">
                <i data-lucide="building"></i> Torre 2 <span class="tab-badge" id="badge-t2">20</span>
              </button>
              <button class="tab-btn" data-tower="Torre 3">
                <i data-lucide="building"></i> Torre 3 <span class="tab-badge" id="badge-t3">20</span>
              </button>
            </div>
          </div>

          <!-- Property Grid -->
          <div class="property-grid" id="properties-grid-container">
            <!-- Dynamic property cards -->
          </div>
        </section>

        <!-- 3. DETALLE DE DEPARTAMENTO VIEW (FICHA TÉCNICA) -->
        <section id="view-detalle" class="app-view">
          <div class="back-nav">
            <button class="btn btn-secondary back-to-condo-btn">
              <i data-lucide="arrow-left"></i> Volver a Condominio
            </button>
          </div>

          <div class="detalle-grid">
            <!-- Left Panel: Ficha de Contacto -->
            <div class="detalle-sidebar glass-card">
              <div class="depto-header-badge">
                <div class="depto-id-badge" id="depto-detail-id">T1-01</div>
                <div class="depto-tower-name" id="depto-detail-tower">Torre 1</div>
              </div>

              <div class="detail-info-group">
                <div class="info-header">
                  <h3>Ficha del Departamento</h3>
                  <button class="btn btn-sm btn-icon" id="btn-edit-contact" title="Editar contacto">
                    <i data-lucide="edit-3"></i>
                  </button>
                </div>
                <div class="info-body">
                  <div class="info-row">
                    <span class="info-label">Propietario / Adm.</span>
                    <span class="info-value" id="depto-detail-name">No registrado</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Rol del Contacto</span>
                    <span class="badge" id="depto-detail-role">-</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Estado Propiedad</span>
                    <select id="depto-status-select" style="padding: 4px 8px; font-size: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); border-radius: 6px; color: #fff; cursor: pointer; outline: none;">
                      <option value="normal">Ocupado / Normal</option>
                      <option value="desocupado">Desocupado</option>
                      <option value="en_venta">En Venta</option>
                    </select>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value" id="depto-detail-email">No registrado</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Celular</span>
                    <span class="info-value" id="depto-detail-phone">No registrado</span>
                  </div>
                  <div class="info-row vertical">
                    <span class="info-label">Notas Adicionales</span>
                    <div class="info-notes-box" id="depto-detail-notes">Sin notas.</div>
                  </div>
                </div>
              </div>

              <!-- Saldo Panel -->
              <div class="depto-balance-box shadow-glow" id="depto-detail-balance-box">
                <span class="balance-title">Saldo Acumulado</span>
                <span class="balance-value" id="depto-detail-balance">$0.00</span>
                <span class="balance-status-text" id="depto-detail-balance-status">Al corriente</span>
              </div>

              <!-- Quick PDF Download -->
              <div class="pdf-download-panel">
                <h4>Generar Estado de Cuenta Anual</h4>
                <div class="pdf-controls">
                  <select id="pdf-year-select">
                    <option value="2025">Año 2025</option>
                    <option value="2026" selected>Año 2026</option>
                  </select>
                  <button class="btn btn-primary btn-full" id="btn-download-pdf">
                    <i data-lucide="file-text"></i> Descargar PDF
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Panel: Ledger / Historial de Transacciones -->
            <div class="detalle-main glass-card">
              <div class="ledger-header" style="border-bottom: none;">
                <div>
                  <h3>Historial de Transacciones (Ledger)</h3>
                  <p class="card-subtitle">Todos los cargos y abonos ordenados cronológicamente</p>
                </div>
                <div class="ledger-actions" style="display: flex; gap: 10px;">
                  <button class="btn btn-secondary" id="btn-open-cargo-modal" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #ef4444;">
                    <i data-lucide="minus-circle"></i> Registrar Cargo
                  </button>
                  <button class="btn btn-gold" id="btn-open-abono-modal">
                    <i data-lucide="plus-circle"></i> Registrar Abono
                  </button>
                </div>
              </div>

              <div class="ledger-filter-bar">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <label for="ledger-filter-from">Desde:</label>
                  <input type="date" id="ledger-filter-from">
                  <label for="ledger-filter-to">Hasta:</label>
                  <input type="date" id="ledger-filter-to">
                  <button class="btn btn-secondary" id="btn-apply-ledger-filter" style="padding: 6px 12px; font-size: 0.8rem;">Filtrar</button>
                  <button class="btn btn-secondary" id="btn-clear-ledger-filter" style="padding: 6px 12px; font-size: 0.8rem;">Limpiar</button>
                </div>
                <button class="btn btn-secondary" id="btn-export-ledger-excel" style="margin-left: auto; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 0.8rem;">
                  <i data-lucide="file-spreadsheet" class="excel-blue" style="width: 14px; height: 14px;"></i> Exportar Excel
                </button>
              </div>

              <div class="table-container ledger-table-container">
                <table class="ledger-table" id="table-ledger">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Mes Corresp.</th>
                      <th>Destino / Banco</th>
                      <th class="text-right">Cargo</th>
                      <th class="text-right">Abono</th>
                      <th class="text-right">Saldo Acum.</th>
                      <th class="text-center" style="width: 80px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Dynamic transactions -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. LECTURAS DE AGUA VIEW -->
        <section id="view-agua" class="app-view">
          <div class="control-panel glass-card water-controls">
            <div class="control-row">
              <div class="control-col">
                <label for="water-period-select"><i data-lucide="calendar"></i> Periodo Trimestral:</label>
                <select id="water-period-select">
                  <option value="2025-Q2">Q2 2025 (Abr - Jun)</option>
                  <option value="2025-Q3">Q3 2025 (Jul - Sep)</option>
                  <option value="2025-Q4">Q4 2025 (Oct - Dic)</option>
                  <option value="2026-Q1">Q1 2026 (Ene - Mar)</option>
                  <option value="2026-Q2" selected>Q2 2026 (Abr - Jun)</option>
                  <option value="2026-Q3">Q3 2026 (Jul - Sep)</option>
                </select>
              </div>
              <div class="control-col">
                <label for="water-price-input"><i data-lucide="dollar-sign"></i> Precio por m³ Excedente:</label>
                <div class="input-addon">
                  <span>$</span>
                  <input type="number" id="water-price-input" value="50" min="0" step="0.5">
                  <span>MXN</span>
                </div>
              </div>
              <div class="control-col">
                <label for="water-limit-input"><i data-lucide="droplet"></i> Límite Base Consumo:</label>
                <div class="input-addon">
                  <input type="number" id="water-limit-input" value="0" min="0" step="1">
                  <span>m³</span>
                </div>
              </div>
            </div>
            <div class="control-row-footer">
              <span class="text-muted"><i data-lucide="info" class="inline-icon"></i> Los cargos generados aparecerán automáticamente en el ledger de cada departamento.</span>
              <button class="btn btn-primary" id="btn-save-water-readings">
                <i data-lucide="save"></i> Guardar y Generar Cargos
              </button>
            </div>
          </div>

          <div class="water-table-card glass-card">
            <div class="card-header border-bottom">
              <div class="flex-space-between">
                <div>
                  <h3>Captura de Lecturas de Agua</h3>
                  <p class="card-subtitle">Registra lecturas para calcular excedentes de consumo trimestral</p>
                </div>
                <div class="water-search-box">
                  <input type="text" id="water-search-input" placeholder="Filtrar por depto...">
                </div>
              </div>
            </div>
            <div class="table-container water-table-scroll">
              <table class="water-table" id="table-water-capture">
                <thead>
                  <tr>
                    <th>Depto</th>
                    <th>Torre</th>
                    <th>Tipo</th>
                    <th>Contacto / Propietario</th>
                    <th>Lectura Inicial (m³)</th>
                    <th>Lectura Final (m³)</th>
                    <th class="text-right">Consumo (m³)</th>
                    <th class="text-right">Excedente (m³)</th>
                    <th class="text-right">Monto a Cobrar</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Dynamic 60 entries -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Comparativa de Agua y Alertas -->
          <div class="water-compare-card glass-card">
            <div class="card-header border-bottom">
              <h3>Comparativa de Consumo entre Periodos</h3>
              <p class="card-subtitle">Historial de consumo global acumulado por torre</p>
            </div>
            <div class="card-body water-compare-chart-container">
              <canvas id="waterCompareChart"></canvas>
            </div>
          </div>
        </section>

        <!-- 5. IMPORTAR EXCEL VIEW -->
        <section id="view-importar" class="app-view">
          <div class="import-grid">
            <!-- Left: Instructions & Dropzone -->
            <div class="glass-card import-actions-card">
              <div class="card-header">
                <h3>Importación Inicial de Datos</h3>
                <p class="card-subtitle">Carga un archivo Excel para poblar abonos y actualizar contactos</p>
              </div>
              <div class="card-body">
                <div class="alert-info-box">
                  <h4><i data-lucide="info"></i> Instrucciones Importantes</h4>
                  <ol>
                    <li>Descarga la plantilla de Excel prediseñada para asegurar el formato correcto de las columnas.</li>
                    <li>Llena el archivo con la información de los pagos y abonos del condominio.</li>
                    <li>Arrastra el archivo aquí o haz clic en el área de carga para importarlo.</li>
                    <li>Verifica la previsualización de datos antes de aplicar los cambios en la base de datos local.</li>
                  </ol>
                </div>

                <div class="template-actions">
                  <button class="btn btn-secondary" id="btn-download-template">
                    <i data-lucide="download"></i> Descargar Plantilla de Ejemplo (.xlsx)
                  </button>
                </div>

                <div class="drop-zone" id="excel-drop-zone">
                  <div class="drop-zone-prompt">
                    <i data-lucide="cloud-lightning" class="drop-icon"></i>
                    <p>Arrastra tu archivo Excel aquí o <span>haz clic para examinar</span></p>
                    <span class="file-types">Formatos aceptados: .xlsx, .xls</span>
                  </div>
                  <input type="file" id="excel-file-input" accept=".xlsx, .xls" class="hidden-file-input">
                </div>

                <div class="import-status-box hidden" id="import-file-details">
                  <div class="file-info">
                    <i data-lucide="file-text" class="excel-blue"></i>
                    <div>
                      <p class="file-name" id="import-file-name">plantilla.xlsx</p>
                      <p class="file-size text-muted" id="import-file-size">0 KB</p>
                    </div>
                  </div>
                  <button class="btn btn-danger btn-sm" id="btn-clear-import">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Preview & Apply -->
            <div class="glass-card import-preview-card">
              <div class="card-header border-bottom">
                <div class="flex-space-between">
                  <div>
                    <h3>Previsualización de Datos</h3>
                    <p class="card-subtitle">Registros validados listos para importar</p>
                  </div>
                  <button class="btn btn-gold disabled" id="btn-apply-import" disabled>
                    <i data-lucide="check-circle"></i> Aplicar Importación (<span id="import-count">0</span>)
                  </button>
                </div>
              </div>
              <div class="card-body preview-body">
                <div class="no-preview-placeholder" id="preview-placeholder">
                  <i data-lucide="eye-off"></i>
                  <p>Ningún archivo cargado</p>
                  <span>Sube un archivo Excel para ver la previsualización aquí</span>
                </div>
                
                <div class="table-container preview-table-container hidden" id="preview-table-container">
                  <table class="preview-table" id="table-import-preview">
                    <thead>
                      <tr>
                        <th>Torre</th>
                        <th>Depto</th>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Mes Corresp.</th>
                        <th>Destino</th>
                        <th class="text-right">Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Dynamic preview lines -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. REPORTES VIEW -->
        <section id="view-reportes" class="app-view">
          <div class="reports-view-grid">
            <!-- Individual PDF Panel -->
            <div class="report-panel-card glass-card">
              <h3>Estado de Cuenta Individual</h3>
              <p class="card-subtitle">Descarga de reporte anual detallado en PDF para un departamento específico</p>
              
              <div class="form-grid" style="margin-top: 20px;">
                <div class="form-group">
                  <label for="report-tower-select">Torre / Sección:</label>
                  <select id="report-tower-select">
                    <option value="Torre 1">Torre 1</option>
                    <option value="Torre 2">Torre 2</option>
                    <option value="Torre 3">Torre 3</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="report-depto-select">Propiedad:</label>
                  <select id="report-depto-select">
                    <!-- Populated dynamically -->
                  </select>
                </div>
                <div class="form-group span-2">
                  <label for="report-year-select">Año Fiscal:</label>
                  <select id="report-year-select">
                    <option value="2025">Año 2025</option>
                    <option value="2026" selected>Año 2026</option>
                  </select>
                </div>
              </div>

              <div class="report-preview-box">
                <h4>Resumen del Periodo Seleccionado</h4>
                <div class="preview-stat" style="margin-top: 12px;">
                  <span>Transacciones:</span>
                  <span id="report-preview-tx-count" class="preview-value-highlight">0</span>
                </div>
                <div class="preview-stat">
                  <span>Saldo Neto Final:</span>
                  <span id="report-preview-balance" class="preview-value-highlight">$0.00</span>
                </div>
              </div>

              <button class="btn btn-primary btn-full" id="btn-report-pdf-individual" style="margin-top: 24px;">
                <i data-lucide="file-text"></i> Generar PDF Individual
              </button>
            </div>

            <!-- Global Reports Panel -->
            <div class="report-panel-card glass-card">
              <h3>Reportes Globales y Descargas</h3>
              <p class="card-subtitle">Exportación masiva de datos en formato PDF y Excel para administración y auditoría</p>
              
              <div class="form-group" style="margin-top: 20px;">
                <label for="report-global-year-select">Año Fiscal de Reportes Globales:</label>
                <select id="report-global-year-select" style="width: 100%;">
                  <option value="2025">Año 2025</option>
                  <option value="2026" selected>Año 2026</option>
                </select>
              </div>

              <div class="excel-options-grid">
                <button class="btn btn-gold btn-full" id="btn-report-global-pdf" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i data-lucide="files"></i> PDF Global Condominio (60 propiedades)
                </button>
                <button class="btn btn-secondary btn-full" id="btn-report-global-excel" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i data-lucide="file-spreadsheet"></i> Exportar Todo a Excel (.xlsx)
                </button>
                
                <h4 style="margin-top: 12px; margin-bottom: 4px; font-size: 0.85rem; color: var(--color-text-secondary);">Exportar por Torre a Excel:</h4>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary" id="btn-export-excel-t1" style="flex: 1;">Torre 1</button>
                  <button class="btn btn-secondary" id="btn-export-excel-t2" style="flex: 1;">Torre 2</button>
                  <button class="btn btn-secondary" id="btn-export-excel-t3" style="flex: 1;">Torre 3</button>
                </div>
                
                <h4 style="margin-top: 16px; margin-bottom: 4px; font-size: 0.85rem; color: var(--color-text-secondary);">Reporte de Ingresos por Destino:</h4>
                <button class="btn btn-secondary btn-full" id="btn-report-destino-income" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i data-lucide="bar-chart-3"></i> Calcular Ingresos por Destino
                </button>
              </div>

              <div id="destino-income-report-container" class="report-preview-box hidden" style="margin-top: 16px;">
                <h4 style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Ingresos por Destino (<span id="destino-report-year-lbl">2026</span>)</span>
                  <button class="btn-icon-sm" id="btn-export-destino-excel" title="Exportar Reporte a Excel"><i data-lucide="file-spreadsheet" style="width: 12px; height: 12px;"></i></button>
                </h4>
                <div style="max-height: 250px; overflow-y: auto; margin-top: 10px;">
                  <table class="audit-log-table" style="width: 100%; font-size: 0.8rem;">
                    <thead>
                      <tr>
                        <th>Destino</th>
                        <th>Mes</th>
                        <th class="text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody id="destino-income-report-body">
                      <!-- Computed dynamically -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. CONFIGURACIÓN VIEW -->
        <section id="view-configuracion" class="app-view">
          <div class="config-view-grid">
            <!-- Backup & DB Actions -->
            <div class="config-card glass-card">
              <h3>Mantenimiento del Sistema</h3>
              <p class="card-subtitle">Resguardo de datos locales y herramientas de restablecimiento</p>
              
              <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 16px;">
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); padding: 16px; border-radius: 10px;">
                  <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: #fff;"><i data-lucide="download-cloud" class="inline-icon" style="color: var(--emerald-primary);"></i> Copia de Seguridad (Backup)</h4>
                  <p class="text-muted text-xs" style="margin-bottom: 12px;">Descarga toda la información registrada en un archivo JSON local.</p>
                  <button class="btn btn-secondary btn-full" id="btn-export-backup">Exportar Respaldo JSON</button>
                </div>
                
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); padding: 16px; border-radius: 10px;">
                  <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: #fff;"><i data-lucide="upload-cloud" class="inline-icon" style="color: var(--gold-primary);"></i> Restaurar Respaldo</h4>
                  <p class="text-muted text-xs" style="margin-bottom: 12px;">Carga un archivo de respaldo JSON generado previamente por esta aplicación.</p>
                  <input type="file" id="backup-file-input" accept=".json" style="display: none;">
                  <button class="btn btn-secondary btn-full" id="btn-import-backup-trigger">Cargar y Restaurar JSON</button>
                </div>
                
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 10px;">
                  <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: #f87171;"><i data-lucide="alert-triangle" class="inline-icon"></i> Zona de Peligro</h4>
                  <p class="text-muted text-xs" style="margin-bottom: 12px;">Borra de manera permanente todas las transacciones, lecturas de agua y fichas de contacto.</p>
                  <button class="btn btn-danger btn-full" id="btn-reset-db-trigger">Restablecer Base de Datos</button>
                </div>
              </div>
            </div>

            <!-- Audit Log Panel -->
            <div class="config-card glass-card">
              <h3>Historial de Cambios (Auditoría)</h3>
              <p class="card-subtitle">Bitácora de operaciones del administrador sobre las cuentas</p>
              
              <div class="audit-log-card">
                <div class="audit-table-container">
                  <table class="audit-log-table" id="table-audit-log">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Operación</th>
                        <th>Entidad</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Dynamic audit logs -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>

  <!-- MODALS -->

  <!-- Modal 1: Edit Contact -->
  <div class="modal-overlay" id="modal-edit-contact">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Editar Ficha del Departamento <span id="modal-edit-depto-id" class="text-gold">T1-01</span></h3>
        <button class="btn-close-modal" id="btn-close-edit-modal">
          <i data-lucide="x"></i>
        </button>
      </div>
      <form id="form-edit-contact">
        <input type="hidden" id="edit-depto-id">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group span-2">
              <label for="edit-contact-name">Nombre del Propietario o Administrador:</label>
              <input type="text" id="edit-contact-name" required placeholder="Nombre completo">
            </div>
            <div class="form-group">
              <label for="edit-contact-role">Rol del Contacto:</label>
              <select id="edit-contact-role" required>
                <option value="propietario">Propietario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-contact-email">Correo Electrónico:</label>
              <input type="email" id="edit-contact-email" placeholder="ejemplo@correo.com">
            </div>
            <div class="form-group">
              <label for="edit-contact-phone">Teléfono Celular:</label>
              <input type="tel" id="edit-contact-phone" placeholder="10 dígitos">
            </div>
            <div class="form-group span-2">
              <label for="edit-contact-notes">Notas del Departamento (Internas):</label>
              <textarea id="edit-contact-notes" rows="3" placeholder="Ingresa comentarios, convenios o aclaraciones..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 2: Registrar Transacción Manual (Abono / Cargo) -->
  <div class="modal-overlay" id="modal-add-abono">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3 id="abono-modal-title">Registrar Abono Manual - <span id="modal-abono-depto-id" class="text-gold">T1-01</span></h3>
        <button class="btn-close-modal" id="btn-close-abono-modal">
          <i data-lucide="x"></i>
        </button>
      </div>
      <form id="form-add-abono">
        <input type="hidden" id="abono-depto-id">
        <input type="hidden" id="abono-tipo" value="abono">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="abono-monto" id="label-abono-monto">Monto del Abono ($ MXN):</label>
              <div class="input-addon">
                <span>$</span>
                <input type="number" id="abono-monto" required min="0.01" step="0.01" placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label for="abono-fecha" id="label-abono-fecha">Fecha del Depósito:</label>
              <input type="date" id="abono-fecha" required>
            </div>
            <div class="form-group" id="group-abono-destino">
              <label for="abono-destino">Destino del Dinero:</label>
              <select id="abono-destino" required>
                <option value="Banorte Miguel">Banorte Miguel</option>
                <option value="NU Miguel">NU Miguel</option>
                <option value="Cuenta Carlos">Cuenta Carlos</option>
                <option value="Carlos no Reportado">Carlos no Reportado</option>
                <option value="Ajuste por Acuerdo">Ajuste por Acuerdo</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="form-group span-2">
              <label for="abono-concepto" id="label-abono-concepto">Concepto / Descripción del Pago:</label>
              <input type="text" id="abono-concepto" required placeholder="Ej. Abono Transferencia Banorte Miguel">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-abono">Cancelar</button>
          <button type="submit" class="btn btn-gold" id="btn-submit-abono">Registrar Pago</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 3: Editar Transacción -->
  <div class="modal-overlay" id="modal-edit-transaction">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Editar Transacción <span id="modal-edit-tx-id" class="text-gold"></span></h3>
        <button class="btn-close-modal" id="btn-close-edit-tx-modal">
          <i data-lucide="x"></i>
        </button>
      </div>
      <form id="form-edit-transaction">
        <input type="hidden" id="edit-tx-id">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="edit-tx-monto">Monto ($ MXN):</label>
              <div class="input-addon">
                <span>$</span>
                <input type="number" id="edit-tx-monto" required min="0.01" step="0.01">
              </div>
            </div>
            <div class="form-group">
              <label for="edit-tx-fecha">Fecha:</label>
              <input type="date" id="edit-tx-fecha" required>
            </div>
            <div class="form-group" id="group-edit-tx-destino">
              <label for="edit-tx-destino">Destino (si aplica):</label>
              <select id="edit-tx-destino">
                <option value="">Ninguno / Cargo</option>
                <option value="Banorte Miguel">Banorte Miguel</option>
                <option value="NU Miguel">NU Miguel</option>
                <option value="Cuenta Carlos">Cuenta Carlos</option>
                <option value="Carlos no Reportado">Carlos no Reportado</option>
                <option value="Ajuste por Acuerdo">Ajuste por Acuerdo</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="form-group span-2">
              <label for="edit-tx-concepto">Concepto / Descripción:</label>
              <input type="text" id="edit-tx-concepto" required>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-edit-tx">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 4: Confirmar Eliminación -->
  <div class="modal-overlay" id="modal-confirm-delete">
    <div class="modal-content glass-card modal-sm">
      <div class="modal-header" style="border-bottom: none;">
        <h3>¿Eliminar Transacción?</h3>
        <button class="btn-close-modal" id="btn-close-delete-modal">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body" style="padding-top: 0;">
        <p class="text-muted text-sm">Esta acción no se puede deshacer. Se recalculará el saldo de la propiedad inmediatamente.</p>
        <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.8rem;">
          <div style="display: flex; justify-content: space-between;"><span class="text-muted">Concepto:</span><span id="delete-tx-concept" class="font-bold"></span></div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px;"><span class="text-muted">Monto:</span><span id="delete-tx-amount" class="text-gold font-bold"></span></div>
        </div>
      </div>
      <div class="modal-footer" style="background: none; border-top: none;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-delete">Cancelar</button>
        <button type="button" class="btn btn-danger" id="btn-confirm-delete">Eliminar</button>
      </div>
    </div>
  </div>

  <!-- Modal 5: Confirmar Reset Base de Datos -->
  <div class="modal-overlay" id="modal-confirm-reset">
    <div class="modal-content glass-card modal-sm">
      <div class="modal-header" style="border-bottom: none;">
        <h3>Restablecer Base de Datos</h3>
        <button class="btn-close-modal" id="btn-close-reset-modal">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body" style="padding-top: 0;">
        <p class="text-muted text-sm" style="color: #f87171 !important;"><strong>¡ADVERTENCIA!</strong> Se eliminarán todos los registros de abonos, cargos de agua y fichas de contacto.</p>
        <p class="text-muted text-xs" style="margin-top: 10px;">Para confirmar, escribe la palabra <strong style="color: #fff;">RESETEAR</strong> abajo:</p>
        <input type="text" id="confirm-reset-input" placeholder="Escribe RESETEAR aquí" style="width: 100%; padding: 10px; margin-top: 8px; border-radius: 8px; background: rgba(0,0,0,0.35); border: 1px solid rgba(239,68,68,0.3); color: #fff; text-align: center; font-weight: 700; outline: none;">
      </div>
      <div class="modal-footer" style="background: none; border-top: none;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-reset">Cancelar</button>
        <button type="button" class="btn btn-danger disabled" id="btn-confirm-reset" disabled>Restablecer</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification System -->
  <div id="toast-container" class="toast-container"></div>

  <!-- JS Implementation -->
  <script>
      window.currentUser = {
          id: {{ auth()->user()->id }},
          name: "{{ auth()->user()->name }}",
          email: "{{ auth()->user()->email }}",
          role: "{{ auth()->user()->role }}",
          department_id: "{{ auth()->user()->department_id }}"
      };
      window.csrfToken = "{{ csrf_token() }}";
  </script>
  <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
