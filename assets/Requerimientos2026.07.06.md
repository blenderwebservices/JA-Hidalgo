6 Jul 2026

Modificaciones y arreglos al sistema de jardines de allende:

• Verificar que si funcione ingresar con las credenciales de un usuario normal .

• En Propiedades-Historial de Transacciones, agrega una accion que permita imprimir por linea el reporte de cargo o abono en pdf, que directamente lo descargue, encargate del formato, con encabezado apropiado, asignado al departamento, fecha, importe y nota del pago. No pongas el destino del pago. 

• En condominio (vista resumida) hay cuentas que aparecen en rojo y con negativo cuando están en ceros (0.00), en Excel eso me pasa cuando hay algo en negativo, pero no se nota porque hay milesimas presentes. Redondea a dos decimales los importes en todos los reportes en pdf y emisiones de excel, para que no se presente el fenomeno de -0.00.

• En vista resumida de saldos, cuando pides imprimir VISTA RESUMIDA DE SALDOS solo aparece una hoja con encabezados y aquí los saldos en ceros se ven igual que en el punto anterior. Esto va junto con la recomendacion del punto anterior de los decimales.

• Los usuarios normales no deben ver el card donde se muestran los ultimos 5 abonos hechos, solo para los administradores.

• Genera un rol de usuario del tipo "Admin-solo lectura" que pueda ver todo el detalle pero que no pueda modificar nada, ni imprimir pdf, ni emitir excel, solo ver y navegar.

Confirma en el readme.md que tipo de respaldo haces y como funciona la restauracion. Esto para aclarar la siguiente duda:
• "si genero un respaldo y luego cargo de nuevo el archivo en teoría debería eliminar los movimientos que se hayan tenido entre el último respaldo y la restaurada, ¿verdad?" 

Es importante confirma la vista para usuarios condominos y para usuarios admin-solo lectura. Documentalo en el readme.md .


He actualizado el generador del recibo individual en formato PDF (public/js/app.js) para cumplir con todos los requerimientos:

Encabezado Mejorado: Se agregó el logotipo y el título del condominio ("Jardines de Allende Hidalgo" - "ADMINISTRACIÓN DE CONDOMINIO") alineado de la misma manera que en el reporte del Estado de Cuenta.
Eliminación del Periodo: Se removió la línea que mostraba el periodo de pago (mes correspondiente) para simplificar la información del recibo.
Tabla de Saldos: Se implementó una tabla limpia en la parte inferior del recibo utilizando jsPDF-AutoTable que muestra:
Su pago, gracias / Cargo registrado: El importe de la transacción generada (en verde si es abono o rojo si es cargo).
Saldo posterior al pago: El saldo exacto de la propiedad en el momento que se registró el recibo.
Saldo final [fecha de hoy]: El saldo acumulado actual de la propiedad.
Los saldos deudores (negativos) se mostrarán automáticamente en rojo en la tabla. Ahora los recibos lucirán más completos y con el estado de cuenta claro en cada emisión.