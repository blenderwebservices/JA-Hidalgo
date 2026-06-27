# Plan de Implementación - App de Administración Jardines de Allende Hidalgo (Actualizado v2)

Esta es la propuesta técnica actualizada para crear la aplicación web de administración de cuotas de mantenimiento y agua del condominio **Jardines de Allende Hidalgo**.

La aplicación será una Single-Page Application (SPA) moderna, responsiva y de alto rendimiento que almacenará la información localmente en el navegador (`LocalStorage` o `IndexedDB`) para que sea 100% autónoma, segura y no requiera de un servidor backend.

---

## Estructura de Datos (Base de Datos Local)

La base de datos se inicializará con **3 torres (Torre 1, Torre 2, Torre 3)** y sus respectivas propiedades (60 propiedades en total):
- **Torre 1**: 20 departamentos numerados del `1` al `20` (ID: `T1-01` a `T1-20`).
- **Torre 2**: 18 departamentos numerados del `1` al `18` (ID: `T2-01` a `T2-18`) y 2 locales comerciales denominados `Local 1` y `Local 2` (ID: `T2-L1` y `T2-L2`).
- **Torre 3**: 20 departamentos numerados del `1` al `20` (ID: `T3-01` a `T3-20`).

Se guardarán las siguientes colecciones en el almacenamiento local:

### 1. Departamentos (`departments`)
- `id`: Identificador único (ej. `T1-01`, `T2-L1`)
- `torre`: `"Torre 1"`, `"Torre 2"` o `"Torre 3"`
- `tipo`: `"departamento"` o `"local"`
- `numero`: String (ej. `"1"`, `"2"`, `"Local 1"`)
- `contactoNombre`: Nombre del contacto (Propietario o Administrador)
- `contactoRol`: Rol del contacto (`"propietario"` o `"administrador"`)
- `contactoEmail`: Correo electrónico del contacto
- `contactoCelular`: Teléfono celular del contacto
- `notas`: Notas adicionales del departamento (editable por el administrador)

### 2. Transacciones (`transactions`)
- `id`: Identificador único
- `deptoId`: Referencia al departamento (ej. `T1-01`)
- `fecha`: Fecha de la transacción (YYYY-MM-DD)
- `tipo`: `"cargo"` o `"abono"`
- `concepto`: Descripción (ej. `"Cuota Mantenimiento Abril 2025"`, `"Lectura Excedente Agua Q2 2025"`, `"Abono Transferencia BBVA"`, o cargos manuales como `"Cuota Extraordinaria: Reparación Portón"`, `"Multa: Infracción de reglamento"`)
- `mesCorrespondiente`: Mes al que corresponde (ej. `"2025-04"`)
- `destinoAbono`: Banco o destino del dinero (ej. `"BANORTE"`, `"Nu"`, `"Efectivo"`) - Solo aplica para abonos
- `monto`: Número decimal positivo

### 3. Lecturas de Agua (`water_readings`)
- `id`: Identificador único
- `deptoId`: Referencia al departamento (ej. `T1-01`)
- `periodo`: Trimestre (ej. `"2025-Q2"` para Abr-Jun 2025, `"2025-Q3"` para Jul-Sep 2025, etc.)
- `lecturaInicial`: Decimal (m³)
- `lecturaFinal`: Decimal (m³)
- `excedente`: Decimal (m³ calculados automáticamente)
- `precioPorM3`: Precio cobrado por m³ excedente
- `montoCobrado`: Monto total del cargo generado

---

## Reglas de Negocio y Cargos Automatizados

1. **Fecha de Inicio de la Administración**: 1 de abril de 2025.
2. **Cargos Fijos Mensuales**:
agregar un cargo inicial por concepto de "Adeudo Administración MORADA" de $0.00 y que este mismo se pueda editar en cualquier momento con acceso por contraseña del adminsitrador del sistema la contraseña para entrar al sistema es "Info1929" y se podrá cambiar en cualquier momento desde el panel de administración.

   - Se generan el día 1 de cada mes a partir del 1 de abril de 2025.
   - **Mantenimiento**: $840.00 MXN.
   - **Agua Fijo**: $82.00 MXN.
   los cargos pueden ser modificados por el adminsitrador del sistema con acceso por contraseña
3. **Cargos Trimestrales por Excedente de Agua**:
   - Se calculan de manera trimestral basados en lecturas iniciales y finales.
   - Los trimestres siguen el ciclo administrativo:
     - **Q2 2025**: Abril - Junio (Primer trimestre aplicable)
     - **Q3 2025**: Julio - Septiembre
     - **Q4 2025**: Octubre - Diciembre
     - **Q1 2026**: Enero - Marzo (y subsecuentes)
   - El administrador ingresa las lecturas de agua por departamento para cada trimestre y especifica el **precio por m³ excedente** y el **límite de consumo base (m³)** (por defecto 0 m³).
   - Al guardar las lecturas, se genera automáticamente un cargo en el historial del departamento con el concepto `"Excedente Agua Trimestre [Q] [Año]"`.

---

## Interfaz de Usuario (UI/UX)

La aplicación tendrá un diseño de alta gama inspirado en *glassmorphism*, con una paleta de colores verde esmeralda profundo (representando "Jardines") y detalles dorados/ámbar premium.

### Vistas Principales:

1. **Dashboard (Panel General)**:
   - Resumen financiero global: Total Cargado, Total Cobrado, Deuda Pendiente, Porcentaje de Cobranza.
   - Gráfico interactivo (Chart.js): Comparativa mensual de Cargos vs. Abonos.
   - Alertas rápidas: Departamentos con mayor morosidad.

2. **Condominio (Torre 1, Torre 2, Torre 3)**:
   - Vista por pestañas para cambiar rápidamente entre Torre 1, Torre 2 y Torre 3.
   - En Torre 2 se mostrarán de forma destacada el `Local 1` y `Local 2`.
   - Tarjetas interactivas que muestran el saldo actual de cada departamento (Verde si está al corriente o con saldo a favor, Rojo si tiene adeudo).
   - Buscador rápido por número de departamento o nombre de contacto.

3. **Detalle de Departamento (Ficha Técnica)**:
   - Formulario para editar: **Nombre del Contacto**, **Rol del Contacto** (Propietario / Administrador), **Email**, **Celular** y **Notas Adicionales**.
   - Historial completo de transacciones (Ledger) con opción de registrar un **Abono Manual** (Monto, Fecha, Destino del Abono, Mes correspondiente) o un **Cargo Manual (Cuota Extraordinaria, Multa, etc.)** (Monto, Fecha, Concepto, Mes correspondiente).
   - Generación de **Estado de Cuenta Anual** individual en PDF con descarga directa.

4. **Lecturas de Agua**:
   - Panel interactivo para registrar las lecturas del trimestre seleccionado.
   - Permite definir el costo de m³ y el límite base para el cálculo global.
   - Tabla de captura rápida para las 60 propiedades.

5. **Importar Excel (Primera Vez)**:
   - Panel de importación drag-and-drop con soporte para archivos `.xlsx` y `.xls`.
   - Muestra instrucciones claras, un botón para descargar una **Plantilla de Excel de Ejemplo**, y una tabla de previsualización antes de aplicar los datos.
   - **Validación robusta**: Valida que la torre sea 1, 2 o 3, que el departamento exista (ej. 1 al 20, 1 al 18 o Local 1/Local 2), que la fecha sea válida, y que el monto sea numérico.
   - Bloqueo o advertencia si ya se realizó una importación previa.

---

## Estructura del Reporte Anual PDF

El PDF se generará directamente en el cliente usando las librerías `jsPDF` y `jsPDF-AutoTable` y este se podrá descargar desde el panel de administración, el pdf incluirá todas las transacciones del año seleccionado.

### Diseño del Reporte:
- **Cabecera**: Logotipo exclusivo de *Jardines de Allende Hidalgo*, nombre del condominio, torre y departamento, nombre y rol del contacto (Propietario/Administrador), celular, año del reporte y saldo acumulado final.
- **Tabla de 6 Columnas**:
  1. **Concepto**: Descripción de la transacción (ej. `"Cargo Cuota de Mantenimiento"`, `"Abono - Transferencia BBVA"`).
  2. **Mes correspondiente**: El mes al que aplica el cobro/pago (ej. `"Abril 2025"`).
  3. **Destino de Abono**: Lugar de depósito (ej. `"BBVA"`, `"Efectivo"`, `"Santander"`) o vacío para cargos.
  4. **Cargos ($)**: Monto del cargo (vacío para abonos).
  5. **Abonos ($)**: Monto del abono (vacío para cargos).
  6. **Saldo ($)**: Saldo acumulado (cálculo acumulativo cronológico). Si el saldo acumulado es negativo (adeudo), se imprimirá en **rojo** (`#dc2626`).

---

## Archivos a Crear en el Espacio de Trabajo

1. [index.html](file:///c:/Users/migue/OneDrive/CARPETA%20DE%20TRABAJO/EVENTOS/Antigravity/JA%20Hidalgo/index.html): Estructura del SPA.
2. [index.css](file:///c:/Users/migue/OneDrive/CARPETA%20DE%20TRABAJO/EVENTOS/Antigravity/JA%20Hidalgo/index.css): Estilos modernos, responsivos, tema verde esmeralda y oro, y estilos de impresión.
3. [app.js](file:///c:/Users/migue/OneDrive/CARPETA%20DE%20TRABAJO/EVENTOS/Antigravity/JA%20Hidalgo/app.js): Lógica de base de datos local, cálculos de agua, importación de Excel, y motor de reportes PDF.

---

## Plan de Verificación

### Pruebas Manuales:
1. **Inicialización**: Verificar que al abrir la app se generen los cargos fijos desde el 1 de abril de 2025 hasta el mes actual de manera automática.
2. **Registro de Notas y Datos de Contacto**: Guardar notas, propietario (con su rol de Propietario o Administrador), email, celular en un departamento, recargar la página y verificar que persistan.
3. **Cargos y Abonos Manuales**: Registrar un abono manual y un cargo manual (ej. multa o cuota extraordinaria) y verificar que se agreguen correctamente al historial, afectando el saldo de manera correcta.
4. **Importar Excel**: Cargar el archivo de Excel de prueba y verificar que se registren los abonos correctamente en el historial de transacciones de cada departamento.
5. **Cálculo de Agua**: Registrar lecturas de agua para un departamento, verificar que calcule el excedente y genere el cargo correspondiente.
6. **Generar PDF**: Descargar el reporte anual de un departamento y corroborar las 6 columnas y que el saldo en contra (negativo) aparezca en rojo, y que incluya los datos de contacto y rol.

