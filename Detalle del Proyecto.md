Necesito crear un nuevo proyecto a partir de MenajeHouseV2, la carpeta es: D:\Electrosun\menajeHouseV2
Crear planificación, usar misma base de datos, usar el mismo .env
Usar VUE3, Pinia, etc
Para la interfaz usar Quasar
Usar PNPM, vite

Los módulos serán:

1. Dashboard
Siempre mostrará la información del mes actual

Detalle de las tarjetas a mostrar:
Total de ventas: es el total de ventas del mes actual
Ventas Live: es el total de ventas pagadas de las ventas live del mes actual
Ventas Diarias: es el total de ventas diarias del mes actual
Pendiente Pago Live: total de ventas que están en estado pendiente de pago del mes actual
Pendiente Retiro: cantidad de ventas live que están en estado pendiente de retiro
Cantidad Ventas: total de cantidad de ventas diarias del mes actual

Gráfico de ventas mensuales
Eje vertical: $ 
EjeHorizontal: 12 Meses 

2. Punto de venta 
Usar el que ya existe
Agregar botón para limpiar el carrito

3. Ventas Live
Siguiendo la misma interfaz general, cambiar:
los bugget:
Total Valor Ofrecido en $
Total Valor Asignado a clientes $
Total Ítems ofrecidos (cantidad)
Total Ítems con Clientes asignados (cantidad) 

Area de Registrar Venta:
Monto (se mantiene)
Código (se mantiene)
Caja (se agrega, listado de cajas)

Area Ventas Registradas:
Se mantiene listado, pero con la siguiente detalle y funcionalidad:
cada item tendrá: código, cliente (como un listado desplegable para elegir, por defecto será Cliente Desconocido), Valor, Fecha (corta, si es hoy aparece Hoy), botón de imprimir (misma funcionalidad actual), botón editar (misma funcionalidad actual), botón eliminar (misma funcionalidad actual)
Todo lo demás sigue igual, misma funcionalidad

4. Pendientes Live
Esta es una sección nueva, sirve para ver los productos pendiente de retiro y pendiente de pago, con posibilidad de cambiar los estados.
Antes de la siguiente tabla, debe haber campos de búsqueda por cliente, y poder seleccionar o filtrar fecha de los Live.
Tendrá una tabla con las columnas:
Cliente
Fecha Live
Código
Valor
Estado Pago
Fecha Pago
Modo Pago
Estado Retiro
Quien Retiró

Las filas deben estar agrupadas por cliente, y al hacer clic en la fila se debe desplegar el detalle de cada producto con toda la info.
Al inicio de cada fila debe haber un seleccionador para poder cambiar el estado de pago y/o retiro, según corresponda.
Al cambiar el estado de pago debe haber la posibilidad de ingresar modo de pago.
Al cambiar el estado de retiro debe haber la posibilidad de ingresar quien retira (por defecto nombre del cliente)
Los estado de pago serán: pendiente y pagado
Los estado de retiro serán: pendiente y retirado


5. Reportes
Debe existir reporte de:
Ventas Live: todos los filtros y búsquedas
Ventas Diarias: Actual Historial de ventas Diarias
	- Agregar campo para buscar por cliente, código
	- Agregar filtrar por fecha, fecha exacta, mes, año