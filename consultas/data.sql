
use DBREACT_VENTA
GO

--INSERTAR ROLES
insert into Rol(descripcion,esActivo) values ('Administrador',1)
insert into Rol(descripcion,esActivo) values ('Empleado',1)

go

--INSERTAR USUARIO
INSERT INTO Usuario(nombre,correo,telefono,idRol,clave,esActivo) values
('victor','user@gmail.com','87549961',1,'123',1),
('kenley','kenleyjos619@gmail.com','58083149',1,'U2FsdGVkX1/YgR8IrHK58PdLOAfeGhnJEMFLZhOixHg=',1),
('victor','victorR@gmail.com','87549961',2,'U2FsdGVkX1/YgR8IrHK58PdLOAfeGhnJEMFLZhOixHg=',1)

select * from Usuario

go
-- INSERTAR CATEGORÍAS
insert into Categoria(descripcion, esActivo) values 
('Herramientas Manuales', 1),
('Herramientas Eléctricas', 1),
('Materiales de Construcción', 1),
('Pinturas y Adhesivos', 1),
('Iluminación', 1),
('Accesorios de Plomería', 1);
go

-- INSERTAR NUEVAS CATEGORÍAS
insert into Categoria(descripcion, esActivo) values 
('Ferretería', 1),
('Equipos de Jardinería', 1),
('Material Eléctrico', 1),
('Seguridad Industrial', 1),
('Accesorios para Hogar', 1);
go


-- INSERTAR PRODUCTOS
insert into Producto(codigo, marca, descripcion, idCategoria, stock, precio, esActivo) values
('H101A', 'Truper', 'Martillo de acero 16oz', 1, 50, 150.00, 1),
('H102B', 'Stanley', 'Desarmador estrella', 1, 40, 85.00, 1),
('E201C', 'DeWalt', 'Taladro eléctrico 500W', 2, 25, 1200.00, 1),
('E202D', 'Bosch', 'Sierra circular 7 pulgadas', 2, 15, 2200.00, 1),
('C301E', 'Cemex', 'Bolsa de cemento 50kg', 3, 100, 250.00, 1),
('C302F', 'Ternium', 'Lámina de acero galvanizado', 3, 30, 450.00, 1),
('P401G', 'Comex', 'Pintura blanca 19L', 4, 20, 900.00, 1),
('P402H', 'Resistol', 'Adhesivo industrial 1L', 4, 50, 75.00, 1),
('I501I', 'Philips', 'Foco LED 9W', 5, 100, 40.00, 1),
('I502J', 'Osram', 'Reflector LED 20W', 5, 30, 250.00, 1),
('A601K', 'Rotoplas', 'Llave mezcladora de bronce', 6, 20, 350.00, 1),
('A602L', 'Nacobre', 'Tubo de cobre 3/4 pulgada', 6, 50, 180.00, 1);
go

-- INSERTAR 50 NUEVOS PRODUCTOS
insert into Producto(codigo, marca, descripcion, idCategoria, stock, precio, esActivo) values
('F701A', 'Truper', 'Clavo de acero', 1, 200, 10.00, 1),
('F702B', 'Stanley', 'Serrucho manual', 1, 30, 120.00, 1),
('F703C', 'Stanley', 'Cinta métrica 5m', 1, 50, 75.00, 1),
('F704D', 'Black&Decker', 'Llave ajustable', 1, 40, 200.00, 1),
('F705E', 'Truper', 'Pinza de presión', 1, 35, 150.00, 1),
('J801F', 'Stihl', 'Motosierra 18"', 2, 15, 4500.00, 1),
('J802G', 'Fiskars', 'Tijera de podar', 2, 25, 180.00, 1),
('J803H', 'Honda', 'Cortadora de césped', 2, 10, 6000.00, 1),
('J804I', 'Gardena', 'Aspersor 360°', 2, 50, 250.00, 1),
('J805J', 'Black&Decker', 'Desbrozadora', 2, 20, 3200.00, 1),
('E901K', 'Philips', 'Interruptor 2 vías', 3, 100, 60.00, 1),
('E902L', 'Osram', 'Foco tubular LED', 3, 80, 120.00, 1),
('E903M', 'Philips', 'Socket E27', 3, 200, 25.00, 1),
('E904N', 'Bticino', 'Apagador', 3, 150, 35.00, 1),
('E905O', 'Schneider', 'Breaker 15A', 3, 70, 180.00, 1),
('S1001P', '3M', 'Casco de seguridad', 4, 30, 450.00, 1),
('S1002Q', 'Honeywell', 'Guantes de nitrilo', 4, 100, 25.00, 1),
('S1003R', '3M', 'Mascarilla N95', 4, 200, 40.00, 1),
('S1004S', 'Caterpillar', 'Botas industriales', 4, 20, 850.00, 1),
('S1005T', 'Steelpro', 'Lentes de seguridad', 4, 150, 60.00, 1),
('H1101U', 'Rotoplas', 'Regadera baño', 5, 30, 600.00, 1),
('H1102V', 'Teka', 'Fregadero acero', 5, 10, 2500.00, 1),
('H1103W', 'Fisher', 'Extractor de aire', 5, 15, 1800.00, 1),
('H1104X', 'LG', 'Purificador agua', 5, 8, 3500.00, 1),
('H1105Y', 'Philco', 'Plancha ropa', 5, 50, 450.00, 1),
('F706F', 'Truper', 'Nivel burbuja', 1, 40, 120.00, 1),
('F707G', 'Stanley', 'Sierra mano', 1, 25, 300.00, 1),
('F708H', 'Truper', 'Cortadora PVC', 1, 20, 400.00, 1),
('F709I', 'Makita', 'Taladro 18V', 2, 15, 2200.00, 1),
('F710J', 'Bosch', 'Rotomartillo', 2, 12, 3000.00, 1),
('F711K', 'DeWalt', 'Esmeril 600W', 2, 20, 1700.00, 1),
('F712L', 'Truper', 'Rasqueta plana', 1, 35, 90.00, 1),
('F713M', 'Stanley', 'Cinta eléctrica', 1, 100, 30.00, 1),
('F714N', 'Black&Decker', 'Llave hexagonal', 1, 60, 150.00, 1),
('J806O', 'Honda', 'Bomba de agua', 2, 10, 4500.00, 1),
('J807P', 'Gardena', 'Aspersor línea', 2, 50, 300.00, 1),
('J808Q', 'Stihl', 'Podadora manual', 2, 40, 400.00, 1),
('J809R', 'Fiskars', 'Rastrillo', 2, 70, 100.00, 1),
('J810S', 'Honda', 'Generador 1kW', 2, 5, 8000.00, 1),
('E906T', 'Bticino', 'Toma corriente', 3, 120, 40.00, 1),
('E907U', 'Schneider', 'Tablero 8P', 3, 15, 1800.00, 1),
('E908V', 'Osram', 'Lámpara LED', 3, 50, 250.00, 1),
('E909W', 'Philips', 'Foco halógeno', 3, 30, 80.00, 1),
('E910X', 'Schneider', 'Transformador', 3, 10, 3500.00, 1),
('S1006Y', '3M', 'Cinta reflectiva', 4, 150, 20.00, 1),
('S1007Z', 'Caterpillar', 'Guantes cuero', 4, 50, 120.00, 1),
('S1008A', 'Steelpro', 'Arnés seguridad', 4, 15, 1500.00, 1),
('S1009B', '3M', 'Protector auditivo', 4, 100, 200.00, 1),
('S1010C', 'Honeywell', 'Traje bioseguro', 4, 10, 2500.00, 1);
go


insert into NumeroDocumento(id) values(0)



SELECT TOP 4 
    p.descripcion AS Producto,
    COUNT(*) AS Total
FROM 
    Producto p
JOIN 
    DetalleVenta dv ON p.idProducto = dv.idProducto
JOIN 
    Venta v ON dv.idVenta = v.idVenta
WHERE 
    v.fechaRegistro >= DATEADD(DAY, -30, GETDATE()) -- Filtra por ventas en los últimos 30 días
GROUP BY 
    p.descripcion
ORDER BY 
    COUNT(*) DESC;

