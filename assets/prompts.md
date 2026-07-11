## Prompts y Despliegue

1.
crea una app filament php con sqlite como base de datos, genera seeds con la informacion actual, conserva el backend con lo que hay ahora (aplicando los cambios de la base de datos). En el front coloca un landing que explique lo que hace la app (administrador de condominios), pon acceso al dashboard , opciones para login y registro. En el back pon un crud para usuarios , todos para role admin y solo datos para role condomino. Utiliza los assets para ilustrar el encabezado y el logo.
2.
en el dashboard elimina el widget de filament. Agrega widgets relevantes. En el backend coloca un acceso al front. En el Dashboard interactivo coloca un acceso al dashboard principal.
3.
algo no funciona con el link al panel admin principal (ruta /admin ), corrige.
4. Despliegue
    subir a un repositorio github:
    https://github.com/blenderwebservices/JA-Hidalgo

    servidor de dominios; elegir un dominio e ir a dns, crear un registro A (servidor: subdominio), direccion IP

    servidor linux:
    crear un subdominio, apuntando a /public

    generar un ssl y obtener la llave

    servidor de dominios; crear un registro TXT para _acme-challenge subdominio,  y poner la llave. Confirmar.

    servidor linux
    confirmar el ssl. Terminar de configurar el ssl.

    Ir al administrador de github, crear un registro apuntando a la cuenta de github y al repositorio
    recuperar y desplegar
    
    lun 29 junio 2026
    Haz un analisis del documento Actualizaciones al 28 de Junio.docx y haz una propuesta de integracion de mejoras.


    Propuesta de Integración - Actualizaciones al 28 de Junio (v1.2)
Esta propuesta detalla la estrategia de desarrollo para implementar las solicitudes indicadas en el archivo Actualizaciones al 28 de junio.docx para la plataforma Jardines de Allende Hidalgo.

La aplicación actual consta de un panel administrativo Laravel + Filament (v3) y un Dashboard Interactivo (SPA) en el frontend que se sincroniza con la base de datos SQLite mediante APIs de sincronización. Las mejoras propuestas se integrarán respetando esta arquitectura local-first para mantener el alto rendimiento de la SPA.

1. Cambios Propuestos por Componente
A. Seguridad, Roles y Acceso (RBAC)
Bloqueo de Condóminos en Panel de Admin (/admin):
Implementar la interfaz FilamentUser en el modelo 
User
.
Definir el método canAccessPanel(Panel $panel): bool para retornar true únicamente si el rol del usuario es 'admin'.
Esto evitará que los condóminos puedan acceder a las vistas del panel de administración principal y ver recursos que no les pertenecen.
Deshabilitar Registro Público:
Remover la configuración de registro (->registration(\App\Filament\Pages\Auth\CustomRegister::class)) del panel en 
AdminPanelProvider.php
.
Actualizar las vistas públicas 
landing.blade.php
 y 
welcome.blade.php
 para eliminar los botones y enlaces de "Registro".
Modificar las rutas en 
web.php
 para eliminar el redireccionamiento de /register a la pantalla de registro de Filament.
Recuperación de Contraseñas:
Activar el método nativo ->passwordReset() en 
AdminPanelProvider.php
. Esto habilitará de forma automática el enlace de "Olvidé mi contraseña" en la pantalla de login de Filament.
B. Control de Convenios en Departamentos
Estructura de Base de Datos:
Crear una migración para agregar el campo con_convenio (booleano, por defecto false) a la tabla departments.
Agregar con_convenio al arreglo $fillable en el modelo 
Department
.
Formulario de Filament (DepartmentResource):
Agregar un control Toggle o Checkbox para con_convenio en 
DepartmentResource.php
.
Hacer el campo notas obligatorio únicamente si con_convenio es verdadero utilizando la validación condicional de Filament:
php

Forms\Components\Textarea::make('notas')
    ->label('Notas Adicionales')
    ->required(fn (Forms\Get $get): bool => (bool) $get('con_convenio'))
Soporte en Dashboard (SPA):
Actualizar el archivo JavaScript del frontend (
app.js
) para manejar el nuevo campo conConvenio al editar departamentos o al validar datos en el ledger local.
C. Módulo "Destino del Dinero"
Estructura de Base de Datos:
Crear la tabla money_destinations con los campos:
id (Clave primaria autoincrementable)
nombre (String, único, ej: "Banorte Miguel", "Efectivo")
administracion_actual (Booleano, por defecto true)
En la tabla transactions, el campo destino_abono (string) funcionará como clave foránea lógica que apunta al nombre de money_destinations. Esto mantiene la compatibilidad con el importador de Excel y los registros históricos existentes.
Administración en Panel de Control:
Crear el modelo MoneyDestination y un Filament Resource MoneyDestinationResource para que el administrador pueda crear, listar y editar las cuentas (nombre y si pertenece a la administración actual o pasada).
Actualizar 
TransactionResource.php
 para que el campo destino_abono cargue sus opciones dinámicamente desde la base de datos en lugar de tenerlas estáticas en el código.
Métricas del Dashboard (SPA):
En la vista de Dashboard (
dashboard.blade.php
), dividir la sección "Total Cobrado" para mostrar el desglose de:
Total Cobrado (Adm. Actual): Suma de abonos cuyo destino tiene administracion_actual = true.
Total Cobrado (Adm. Pasada): Suma de abonos cuyo destino tiene administracion_actual = false.
Asegurar que la suma total (ambas administraciones) siga restándose del "Total Cargado" para calcular correctamente la Deuda Pendiente global y el Porcentaje de Cobranza, como indica el documento.
Historial de Últimos 5 Abonos:
Agregar una tarjeta o sección de ancho completo en la parte inferior del Dashboard para mostrar el desglose de las cuentas de la Administración Actual.
Para cada cuenta (ej: "Banorte Miguel"), se listarán sus últimos 5 abonos en una tabla limpia, mostrando: Fecha, Monto y Concepto / Descripción.
D. Nueva Vista Resumida de Saldos (Unificada)
Pestaña de Navegación de Acceso Libre:
Agregar un enlace de navegación a la barra lateral del Dashboard SPA con el identificador data-view="resumen-saldos" ("Vista Resumida").
Este enlace no será eliminado por applyCondominoRestrictions(), permitiendo que todos los roles (administradores y condóminos) puedan verlo.
Estructura de la Vista:
Crear una tabla compacta optimizada para imprimirse en una sola hoja.
Listará los 60 departamentos con sus saldos netos actuales.
Incluirá un filtro de tipo Checkbox: "Mostrar solo adeudos sin convenio".
Si está activo, filtrará la lista para mostrar únicamente departamentos con saldo deudor (menor a $0.00) y que tengan con_convenio = false.
Dado que los condóminos tienen restringido el acceso a departamentos ajenos por la API estándar, crearemos un método JavaScript especial (DB.getAllDepartments() y DB.getAllTransactions()) y ajustaremos el endpoint /api/db-state de Laravel para que devuelva la información resumida de saldos autorizada para todos los roles.
E. Módulo Completo de Gastos
Estructura de Base de Datos:
Crear las tablas:
expense_groups (id, nombre)
expense_subgroups (id, expense_group_id, nombre)
payment_methods (id, nombre)
expenses (id, fecha, monto, concepto, expense_group_id, expense_subgroup_id, proveedor, payment_method_id, documento)
Administración en Filament:
Crear Filament Resources para que el administrador gestione:
ExpenseGroupResource: Creación de grupos y subgrupos.
PaymentMethodResource: Creación de formas de pago.
ExpenseResource: Registro manual e individual de gastos. Permite adjuntar archivos en el campo documento (ej. facturas en PDF o imágenes de recibos) usando el almacenamiento local /storage.
Integración en Dashboard SPA:
Agregar la sección view-gastos en el Dashboard SPA.
Importador de Excel: Implementar un cargador drag-and-drop de archivos Excel utilizando SheetJS para gastos, validando las columnas requeridas (ID, FECHA, MONTO, CONCEPTO, GRUPO, SUBGRUPO, PROVEEDOR, FORMA DE PAGO, DOCUMENTO).
Visualización de Gastos: Tabla interactiva con filtros por mes/año, grupo y subgrupo.
Reportes de Gastos (Visualizaciones):
Reporte 1: Total de gastos por mes dividido por ejercicio fiscal (Gráfico de barras interactivo con Chart.js).
Reporte 2: Total de gastos contra pagos cobrados por la administración actual (KPI comparativo y gráfico de balance general).
Reporte 3: Gastos por grupo y subgrupo (Gráfico de dona/pastel y lista desglosada).
F. Pizarra de Avisos (Notice Board)
Estructura de Base de Datos:
Crear la tabla notices (id, fecha_creacion, aviso, timestamps).
Administración en Filament:
Crear NoticeResource para que solo el administrador pueda publicar, editar y eliminar avisos.
Visualización Pública:
Agregar una sección o carrusel elegante de "Avisos Recientes" en la cabecera del Dashboard SPA, visible inmediatamente para todos los usuarios.
2. Plan de Migración y Semillas de Datos
Para facilitar las pruebas del usuario y poblar la base de datos con las nuevas tablas, se propone actualizar el archivo DatabaseSeeder.php para incluir:

Destinos de dinero iniciales (Banorte Miguel, NU Miguel, Cuenta Carlos, Carlos no Reportado, Ajuste por Acuerdo, Efectivo, Otro) asignados a Administración Actual o Pasada.
Grupos de gastos de ejemplo (ej. "Mantenimiento", "Servicios", "Nómina") y subgrupos (ej. "Limpieza", "Seguridad", "Agua", "Luz").
Formas de pago de gastos de ejemplo (ej. "Transferencia", "Efectivo", "Cheque").
Gastos iniciales de prueba para validar los reportes.
Avisos de prueba en la Pizarra de Avisos.
3. Plan de Verificación y Pruebas
Pruebas de Flujo
Verificación de Roles y Seguridad:
Iniciar sesión con un usuario condomino y verificar que al intentar ingresar a /admin se reciba un error de acceso denegado (403).
Verificar que la pantalla de registro público ya no esté accesible en la web ni en Filament.
Validar que aparezca la opción de restablecer contraseña.
Verificación de Convenios:
Crear o modificar un departamento en el panel de administrador, marcarlo "Con convenio" y comprobar que el sistema obliga a capturar datos en "Notas".
Verificación de Destinos e Historial en Dashboard:
Validar que en el Dashboard se muestre la separación del dinero cobrado por la administración actual y pasada, y que las cuentas con abonos recientes listen sus últimas 5 transacciones de abono.
Verificación de Vista Resumida:
Ingresar a la pestaña "Vista Resumida" con rol admin y condomino. Activar el Checkbox y comprobar que solo liste departamentos con deudas vigentes y que no tengan convenio activo. Validar la impresión a una sola hoja.
Verificación del Módulo de Gastos e Importación:
Crear grupos y subgrupos de gastos en el panel admin.
Importar un Excel de gastos en el Dashboard SPA, comprobar las validaciones y verificar que se actualicen las gráficas de reportes mensuales y desgloses por categoría.
Verificación de la Pizarra de Avisos:
Publicar un aviso en el panel de Filament y verificar que aparezca inmediatamente en el Dashboard de todos los usuarios.


