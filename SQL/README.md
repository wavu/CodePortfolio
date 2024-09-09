# SQL Functions for Business Applications

This repository contains SQL functions developed for various business applications, including SAP Business One (SAP B1). Below you will find explanations and examples for each function in both English and Spanish.

---

## TiempoLaboral Function

This SQL function calculates the total working hours between two given dates, excluding weekends and lunch breaks. It ensures that only working hours between 07:30 and 17:30 are counted, and deducts lunch time from the total.

### Usage Example:
```sql
SELECT dbo.TiempoLaboral('2024-09-01 08:00:00', '2024-09-02 16:00:00');
```
---

##  CalculateSafetyInventory Function

This SQL function calculates the safety inventory level for a given item (`ItemCode`). It uses historical data from the inventory movements and applies a standard deviation formula to determine the recommended safety stock for the next 3 months.

### Usage Example:
```sql
SELECT dbo.CalculateSafetyInventory('ITEM12345');
```

##  SpNotificacionReservaOV Procedure

This SQL stored procedure is used to send an email notification when certain inventory reservations have been inactive for 30 days. It scans the inventory reservations in the Reservas_InventarioComprometido table and sends a detailed report via email, listing items that have been reserved but have not moved in the last 30 days.

The procedure generates an HTML email with a table containing the DocNum, Cliente, ItemCode, Descripcion, Cant Reservada, and Fecha Reserva of each item. It utilizes SQL Server's sp_send_dbmail to send the email to the specified recipients, copying the corresponding sales representative.

### Usage Example:
```sql
EXEC SpNotificacionReservaOV;
```
