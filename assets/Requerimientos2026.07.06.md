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

