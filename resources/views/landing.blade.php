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
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --font-title: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
            --font-body: 'Inter', system-ui, -apple-system, sans-serif;
            --bg-app: radial-gradient(circle at top right, hsl(154, 49%, 7%), hsl(154, 49%, 3%));
            --bg-card: rgba(10, 30, 23, 0.55);
            --border-glass: rgba(16, 185, 129, 0.18);
            --border-glass-hover: rgba(16, 185, 129, 0.35);
            --emerald-primary: hsl(154, 85%, 42%);
            --emerald-hover: hsl(154, 85%, 35%);
            --emerald-glow: rgba(16, 185, 129, 0.4);
            --gold-primary: hsl(38, 92%, 50%);
            --gold-glow: rgba(217, 119, 6, 0.45);
            --color-text-primary: #ffffff;
            --color-text-secondary: #cbd5e1;
            --color-text-muted: #64748b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-body);
            background: var(--bg-app);
            color: var(--color-text-primary);
            min-height: 100vh;
            overflow-x: hidden;
            line-height: 1.6;
        }

        header.hero {
            position: relative;
            height: 75vh;
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(to bottom, rgba(6, 20, 15, 0.2), rgba(6, 20, 15, 0.95)), url('{{ asset("assets/ejemplo-encabezado.jpg") }}');
            background-size: cover;
            background-position: center;
            filter: brightness(0.65) contrast(1.1);
            z-index: 1;
            transform: scale(1.05);
            transition: transform 1.5s ease-out;
        }

        header.hero:hover .hero-bg {
            transform: scale(1.01);
        }

        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 850px;
            padding: 0 20px;
            margin-top: 50px;
        }

        .navbar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 60px;
            z-index: 10;
            backdrop-filter: blur(10px);
            background: rgba(6, 20, 15, 0.3);
            border-bottom: 1px solid var(--border-glass);
        }

        @media (max-width: 768px) {
            .navbar {
                padding: 16px 20px;
                flex-direction: column;
                gap: 15px;
            }
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-logo {
            width: 42px;
            height: 42px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid var(--border-glass);
            box-shadow: 0 0 15px var(--emerald-glow);
        }

        .brand-text h1 {
            font-family: var(--font-title);
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
            line-height: 1.1;
        }

        .brand-text span {
            font-size: 0.72rem;
            letter-spacing: 0.15em;
            color: var(--gold-primary);
            font-weight: 700;
            display: block;
        }

        .nav-links {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 22px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--emerald-primary), #059669);
            color: #fff;
            box-shadow: 0 4px 14px var(--emerald-glow);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }

        .btn-gold {
            background: linear-gradient(135deg, var(--gold-primary), #b45309);
            color: #fff;
            box-shadow: 0 4px 14px var(--gold-glow);
        }

        .btn-gold:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(217, 119, 6, 0.6);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-glass);
            color: #fff;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: var(--border-glass-hover);
            transform: translateY(-1px);
        }

        .hero-title {
            font-family: var(--font-title);
            font-size: 3.2rem;
            font-weight: 800;
            line-height: 1.15;
            margin-bottom: 20px;
            letter-spacing: -0.02em;
        }

        .hero-title span {
            background: linear-gradient(to right, #ffffff, var(--gold-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
            font-size: 1.15rem;
            color: var(--color-text-secondary);
            margin-bottom: 35px;
            font-weight: 300;
        }

        .actions-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .features-section {
            padding: 80px 40px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-header h2 {
            font-family: var(--font-title);
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .section-header p {
            color: var(--color-text-secondary);
            font-size: 1.05rem;
            font-weight: 300;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
        }

        .feature-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 35px 25px;
            text-align: left;
            transition: all 0.3s ease;
            backdrop-filter: blur(16px);
        }

        .feature-card:hover {
            border-color: var(--border-glass-hover);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .feature-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: var(--emerald-primary);
        }

        .feature-card h3 {
            font-family: var(--font-title);
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .feature-card p {
            color: var(--color-text-secondary);
            font-size: 0.92rem;
            line-height: 1.5;
        }

        footer {
            background: rgba(6, 20, 15, 0.6);
            border-top: 1px solid var(--border-glass);
            padding: 30px 20px;
            text-align: center;
            color: var(--color-text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>

    <nav class="navbar">
        <div class="brand">
            <img src="{{ asset('assets/logo_jardines_hidalgo.png') }}" alt="Logo" class="brand-logo">
            <div class="brand-text">
                <h1>Jardines de Allende</h1>
                <span>ADMINISTRACIÓN</span>
            </div>
        </div>
        <div class="nav-links">
            @auth
                <a href="{{ url('/dashboard') }}" class="btn btn-primary">
                    <i data-lucide="layout-dashboard"></i> Mi Dashboard
                </a>
                <form action="{{ route('filament.admin.auth.logout') }}" method="POST" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn btn-secondary">
                        <i data-lucide="log-out"></i> Cerrar Sesión
                    </button>
                </form>
            @else
                <a href="{{ route('filament.admin.auth.login') }}" class="btn btn-secondary">
                    <i data-lucide="log-in"></i> Iniciar Sesión
                </a>
                <a href="{{ route('filament.admin.auth.register') }}" class="btn btn-gold">
                    <i data-lucide="user-plus"></i> Registrarse
                </a>
            @endauth
        </div>
    </nav>

    <header class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
            <h1 class="hero-title">Gestión Inteligente para <span>Jardines de Allende</span></h1>
            <p class="hero-subtitle">Plataforma transparente de administración de cuotas de mantenimiento, control de excedentes de agua y descarga de estados de cuenta en tiempo real para Hidalgo.</p>
            <div class="actions-group">
                <a href="{{ url('/dashboard') }}" class="btn btn-primary btn-gold" style="padding: 14px 30px; font-size: 1rem;">
                    <i data-lucide="arrow-right-circle"></i> Acceder al Dashboard
                </a>
                @guest
                    <a href="{{ route('filament.admin.auth.register') }}" class="btn btn-secondary" style="padding: 14px 30px; font-size: 1rem;">
                        Crear Cuenta Condómino
                    </a>
                @endguest
            </div>
        </div>
    </header>

    <section class="features-section">
        <div class="section-header">
            <h2>Módulos del Administrador</h2>
            <p>Todo lo necesario para llevar un registro impecable y transparente del condominio.</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i data-lucide="building-2"></i>
                </div>
                <h3>Control de Condominio</h3>
                <p>Monitorea el estado de cuenta y saldos (al corriente o deudor) de los departamentos y locales comerciales en las 3 torres en tiempo real.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i data-lucide="droplet"></i>
                </div>
                <h3>Lecturas de Agua</h3>
                <p>Captura de lecturas trimestrales, con cálculo automático de excedentes según límites de consumo base y tarifas personalizadas.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i data-lucide="file-text"></i>
                </div>
                <h3>Estados de Cuenta PDF</h3>
                <p>Generación y descarga de Estados de Cuenta Anuales para cada propiedad con desglose detallado de cargos, abonos y saldos cronológicos.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i data-lucide="file-spreadsheet"></i>
                </div>
                <h3>Importación de Excel</h3>
                <p>Facilidad de importación masiva de abonos bancarios o cargos históricos directamente desde plantillas de Excel, con validación de integridad.</p>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2026 Jardines de Allende Hidalgo - Administración de Condominios. Todos los derechos reservados.</p>
    </footer>

    <script>
        // Initialize lucide icons
        lucide.createIcons();
    </script>
</body>
</html>
