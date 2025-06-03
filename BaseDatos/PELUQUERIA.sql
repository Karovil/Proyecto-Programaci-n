
CREATE DATABASE bd_tienda_belleza_final;
GO

USE bd_tienda_belleza_final;
GO

CREATE TABLE tipodocumento (
    id_tipodocumento INT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(5)
);
GO
CREATE TABLE tipotelefono (
    id_tipotelefono INT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL,
    activo BIT DEFAULT 1
);
GO
CREATE TABLE cargoempleado (
    id_cargo INT PRIMARY KEY,
    nombrecargo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    activo BIT DEFAULT 1
);
GO
CREATE TABLE ciudad (
    id_ciudad INT PRIMARY KEY,
    nombreciudad VARCHAR(100) NOT NULL
);
GO
CREATE TABLE categoriaproducto (
    id_categoria INT PRIMARY KEY,
    nombrecategoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200)
);
GO
CREATE TABLE formapago (
    id_formapago INT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);
GO
CREATE TABLE descuentomayorista (
    id_descuento INT PRIMARY KEY,
    cantidadminima INT NOT NULL,
    porcentajedescuento DECIMAL(5, 2) NOT NULL,
    activo BIT DEFAULT 1
);
GO
CREATE TABLE empleado (
    id_empleado INT PRIMARY KEY,
    id_tipodocumento INT NOT NULL,
    numerodocumento VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fechanacimiento DATE,
    fechacontratacion DATE not null,
    id_cargo INT NOT NULL,
    activo BIT DEFAULT 1,
    salario INT,
    registrado_por INT, -- Empleado que lo registró
    FOREIGN KEY (id_tipodocumento) REFERENCES tipodocumento(id_tipodocumento),
    FOREIGN KEY (id_cargo) REFERENCES cargoempleado(id_cargo),
    FOREIGN KEY (registrado_por) REFERENCES empleado(id_empleado)
);
GO
CREATE TABLE usuario (
    id_empleado INT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    activo BIT DEFAULT 1,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);
GO
CREATE TABLE tipocliente (
    id_tipocliente INT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);
GO
CREATE TABLE cliente (
    id_cliente INT PRIMARY KEY,
    id_tipodocumento INT NOT NULL,
    numerodocumento VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    fecharegistro date not null,
    activo BIT DEFAULT 1,
    id_empleado INT,
    id_tipocliente INT NOT NULL,
    FOREIGN KEY (id_tipodocumento) REFERENCES tipodocumento(id_tipodocumento),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_tipocliente) REFERENCES tipocliente(id_tipocliente)
);
GO
CREATE TABLE producto (
    id_producto INT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    preciobase DECIMAL(10, 2) NOT NULL,
    costo DECIMAL(10, 2),
    stock INT DEFAULT 0,
    stockminimo INT DEFAULT 5,
    activo BIT DEFAULT 1,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoriaproducto(id_categoria),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);
GO
CREATE TABLE productopromocion (
    id_productopromocion INT PRIMARY KEY,
	id_productoprom INT NOT NULL,
	id_producto INT NOT NULL,
    cantidadproducto INT DEFAULT 1,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);
GO
CREATE TABLE telefono (
    id_telefono INT PRIMARY KEY,
    id_tipotelefono INT NOT NULL,
    numerotelefono VARCHAR(20) NOT NULL,
    id_cliente INT NOT NULL,
    activo BIT DEFAULT 1,
    FOREIGN KEY (id_tipotelefono) REFERENCES tipotelefono(id_tipotelefono),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);
GO
CREATE TABLE direccion (
    id_direccion INT PRIMARY KEY,
    id_ciudad INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    barrio VARCHAR(100),
    referencia VARCHAR(255),
    id_cliente INT NOT NULL,
    activo BIT DEFAULT 1,
    FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);
GO
CREATE TABLE venta (
    id_venta INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    id_formapago INT NOT NULL,
	id_detalleventa INT NOT NULL,
    fechaventa date not null,
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuestos DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    comentarios VARCHAR(255),
    domicilio BIT DEFAULT 0,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_formapago) REFERENCES formapago(id_formapago)
);
GO
CREATE TABLE detalleventa (
    id_detalleventa INT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    preciounitario DECIMAL(10, 2) NOT NULL,
    descuentounitario DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    id_descuento INT,
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_descuento) REFERENCES descuentomayorista(id_descuento)
);
GO
CREATE TABLE serviciodomicilio (
    id_servicio INT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_cliente INT NOT NULL,
    id_direccionentrega INT NOT NULL,
    id_empleado INT NOT NULL,
    fechasolicitud date not null,
    fechaentrega DATETIME,
    activo BIT DEFAULT 1,
    comentarios VARCHAR(255),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_direccionentrega) REFERENCES direccion(id_direccion),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- **** INSERCIÓN DE DATOS ACTUALIZADOS ****

-- 1. tipodocumento
INSERT INTO tipodocumento (id_tipodocumento, descripcion, abreviatura) VALUES
(1, 'Cédula de Ciudadanía', 'CC'),
(2, 'Tarjeta de Identidad', 'TI'),
(3, 'Cédula de Extranjería', 'CE'),
(4, 'Pasaporte', 'PAS'),
(5, 'Registro Civil', 'RC');
GO

-- 2. tipotelefono
INSERT INTO tipotelefono (id_tipotelefono, descripcion, activo) VALUES
(1, 'Móvil', 1),
(2, 'Fijo Residencia', 1),
(3, 'Fijo Oficina', 1),
(4, 'Fax', 0),
(5, 'Otro', 1);
GO

-- 3. cargoempleado
INSERT INTO cargoempleado (id_cargo, nombrecargo, descripcion, activo) VALUES
(1, 'Gerente de Tienda', 'Responsable de la operación general de la tienda', 1),
(2, 'Vendedor', 'Atiende a clientes y gestiona ventas', 1),
(3, 'Estilista Senior', 'Realiza servicios de peluquería avanzados', 1),
(4, 'Cajero', 'Maneja transacciones de pago', 1),
(5, 'Asistente de Bodega', 'Gestiona inventario y pedidos', 1);
GO

-- 4. ciudad
INSERT INTO ciudad (id_ciudad, nombreciudad) VALUES
(1, 'Bogotá'),
(2, 'Medellín'),
(3, 'Cali'),
(4, 'Barranquilla'),
(5, 'Cartagena');
GO

-- 5. categoriaproducto
INSERT INTO categoriaproducto (id_categoria, nombrecategoria, descripcion) VALUES
(1, 'Cuidado Capilar', 'Productos para el cabello: shampoos, acondicionadores, tratamientos'),
(2, 'Maquillaje', 'Cosméticos para rostro, ojos, labios'),
(3, 'Cuidado Corporal', 'Cremas, lociones, aceites para el cuerpo'),
(4, 'Uñas', 'Esmaltes, tratamientos para uñas, accesorios'),
(5, 'Fragancias', 'Perfumes y colonias');
GO

-- 6. formapago
INSERT INTO formapago (id_formapago, descripcion) VALUES
(1, 'Efectivo'),
(2, 'Tarjeta de Crédito'),
(3, 'Tarjeta Débito'),
(4, 'Transferencia Bancaria'),
(5, 'Crédito Directo');
GO

-- 7. descuentomayorista
INSERT INTO descuentomayorista (id_descuento, cantidadminima, porcentajedescuento, activo) VALUES
(1, 10, 5.00, 1),
(2, 25, 10.00, 1),
(3, 50, 15.00, 1),
(4, 100, 20.00, 1),
(5, 5, 2.50, 0);
GO

-- 8. empleado
INSERT INTO empleado (id_empleado, id_tipodocumento, numerodocumento, nombre, apellido, fechanacimiento, fechacontratacion, id_cargo, activo, salario, registrado_por) VALUES
(101, 1, '1010101010', 'Juan', 'Pérez', '1985-03-10', '2015-01-01', 1, 1, 3500000, NULL),
(102, 1, '1020202020', 'María', 'Gómez', '1992-07-20', '2018-05-15', 2, 1, 1800000, 101),
(103, 1, '1030303030', 'Pedro', 'Rodríguez', '1980-01-05', '2010-02-01', 3, 1, 2200000, 101),
(104, 1, '1040404040', 'Ana', 'Martínez', '1995-09-12', '2019-11-01', 4, 1, 1600000, 102),
(105, 1, '1050505050', 'Luis', 'Fernández', '1988-04-25', '2017-08-20', 5, 1, 1500000, 103);
GO

-- 9. usuario
INSERT INTO usuario (id_empleado, usuario, contrasena, activo) VALUES
(101, 'Kro', 'Kro123', 1),
(102, 'Samuelito', 'Samuel123', 1);

GO

-- 10. tipocliente (Modificación: Solo Minorista y Mayorista)
INSERT INTO tipocliente (id_tipocliente, descripcion) VALUES
(1, 'Minorista'),
(2, 'Mayorista');
GO

-- 11. cliente (usando solo id_tipocliente 1 y 2)
INSERT INTO cliente (id_cliente, id_tipodocumento, numerodocumento, nombre, apellido, email, fecharegistro, activo, id_empleado, id_tipocliente) VALUES
(1, 1, '1111111111', 'Laura', 'García', 'laura.garcia@email.com', '2023-01-20', 1, 102, 1), -- Minorista
(2, 1, '2222222222', 'Roberto', 'Sánchez', 'roberto.sanchez@email.com', '2023-01-25', 1, 102, 2), -- Mayorista
(3, 3, '3333333333', 'Sofía', 'López', 'sofia.lopez@email.com', '2023-02-01', 1, 103, 1), -- Minorista
(4, 1, '4444444444', 'Diego', 'Ramírez', 'diego.ramirez@email.com', '2023-02-10', 1, 104, 2), -- Mayorista
(5, 1, '5555555555', 'Elena', 'Torres', 'elena.torres@email.com', '2023-02-15', 0, 104, 1); -- Minorista inactivo
GO

-- 12. producto
INSERT INTO producto (id_producto, codigo, id_categoria, nombre, descripcion, preciobase, costo, stock, stockminimo, activo, id_empleado) VALUES
(1, 'SHP001', 1, 'Shampoo Hidratante', 'Shampoo para cabello seco con extractos naturales', 35.00, 15.00, 100, 10, 1, 105),
(2, 'ACD002', 1, 'Acondicionador Reparador', 'Acondicionador para cabello dañado', 30.00, 12.00, 80, 8, 1, 105),
(3, 'LAB003', 2, 'Labial Rojo Intenso', 'Labial de larga duración color rojo vibrante', 25.00, 10.00, 50, 5, 1, 105),
(4, 'COR004', 3, 'Crema Corporal Nutritiva', 'Crema hidratante con manteca de karité', 40.00, 18.00, 70, 7, 1, 105),
(5, 'ESM005', 4, 'Esmalte de Uñas Rosa', 'Esmalte de secado rápido color rosa pastel', 15.00, 6.00, 120, 15, 1, 105);
GO

-- 13. productopromocion
INSERT INTO productopromocion (id_productopromocion, id_productoprom, id_producto, cantidadproducto) VALUES
(1, 1001, 1, 2),
(2, 1001, 2, 1),
(3, 1002, 3, 3),
(4, 1003, 4, 1),
(5, 1003, 5, 1);
GO

-- 14. telefono
INSERT INTO telefono (id_telefono, id_tipotelefono, numerotelefono, id_cliente, activo) VALUES
(1, 1, '3101234567', 1, 1),
(2, 2, '6017654321', 1, 1),
(3, 1, '3209876543', 2, 1),
(4, 1, '3001122334', 3, 1),
(5, 2, '6045566778', 4, 1);
GO

-- 15. direccion
INSERT INTO direccion (id_direccion, id_ciudad, direccion, barrio, referencia, id_cliente, activo) VALUES
(1, 1, 'Calle 10 # 20-30', 'Chapinero', 'Cerca al parque', 1, 1),
(2, 2, 'Carrera 50 # 15-25', 'El Poblado', 'Edificio Blanco', 2, 1),
(3, 3, 'Avenida 3N # 40-50', 'Granada', 'Frente al centro comercial', 3, 1),
(4, 1, 'Calle 120 # 7-80', 'Usaquén', 'Conjunto Residencial', 4, 1),
(5, 4, 'Calle 72 # 50-10', 'Alto Prado', 'Esquina con droguería', 5, 1);
GO

-- 16. venta (Nota: id_detalleventa se refiere al primer detalle de la venta)
INSERT INTO venta (id_venta, id_cliente, id_empleado, id_formapago, id_detalleventa, fechaventa, subtotal, descuento, impuestos, total, comentarios, domicilio) VALUES
(1, 1, 102, 1, 1, '2023-03-01', 65.00, 0.00, 12.35, 77.35, 'Venta normal en tienda', 0),
(2, 2, 102, 2, 3, '2023-03-05', 101.50, 10.00, 17.10, 107.10, 'Venta mayorista con descuento', 0),
(3, 3, 104, 3, 4, '2023-03-10', 40.00, 0.00, 7.60, 47.60, 'Cliente nuevo, pagó con tarjeta débito', 1),
(4, 4, 102, 1, 5, '2023-03-12', 65.00, 0.00, 12.35, 77.35, 'Cliente importante, pagó en efectivo', 0), -- Cliente 4 era VIP, ahora Mayorista. Comentario ajustado.
(5, 1, 104, 2, 7, '2023-03-15', 30.00, 0.00, 5.70, 35.70, 'Venta de un solo producto', 0);
GO

-- 17. detalleventa
INSERT INTO detalleventa (id_detalleventa, id_venta, id_producto, cantidad, preciounitario, descuentounitario, subtotal, id_descuento) VALUES
(1, 1, 1, 1, 35.00, 0.00, 35.00, NULL),
(2, 1, 2, 1, 30.00, 0.00, 30.00, NULL),
(3, 2, 1, 3, 35.00, 3.50, 101.50, 1),
(4, 3, 4, 1, 40.00, 0.00, 40.00, NULL),
(5, 4, 3, 2, 25.00, 0.00, 50.00, NULL),
(6, 4, 5, 1, 15.00, 0.00, 15.00, NULL),
(7, 5, 2, 1, 30.00, 0.00, 30.00, NULL);
GO

-- 18. serviciodomicilio
INSERT INTO serviciodomicilio (id_servicio, id_venta, id_cliente, id_direccionentrega, id_empleado, fechasolicitud, fechaentrega, activo, comentarios) VALUES
(1, 3, 3, 3, 105, '2023-03-10', '2023-03-10 15:00:00', 1, 'Entrega urgente, llamar antes de llegar.'),
(2, 1, 1, 1, 105, '2023-03-01', '2023-03-01 18:00:00', 0, 'Cliente solicitó domicilio pero luego recogió en tienda.'),
(3, 4, 4, 4, 105, '2023-03-12', NULL, 1, 'Pendiente de entrega, cliente importante.'), -- Cliente 4 era VIP, ahora Mayorista. Comentario ajustado.
(4, 2, 2, 2, 105, '2023-03-05', '2023-03-06 10:00:00', 1, 'Entrega mayorista coordinada.'),
(5, 5, 1, 1, 105, '2023-03-15', '2023-03-15 14:30:00', 1, 'Entrega estándar.');
GO

select * from usuario;
select * from ciudad;
select * from empleado;