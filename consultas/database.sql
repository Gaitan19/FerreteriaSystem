

create database DBREACT_VENTA

go
use DBREACT_VENTA

go

create table Rol(
idRol int primary key identity(1,1),
descripcion varchar(100),
esActivo bit,
fechaRegistro datetime default getdate()
)

go

create table Usuario(
idUsuario int primary key identity(1,1),
nombre varchar(80),
correo varchar(80) unique,
telefono varchar(40),
idRol int references Rol(idRol),
clave varchar(200),
esActivo bit
)

go

create table Categoria(
idCategoria int primary key identity(1,1),
descripcion varchar(80),
esActivo bit,
fechaRegistro datetime default getdate()
)
go
create table Proveedor (
    idProveedor int primary key identity(1,1),
    nombre varchar(100),
    correo varchar(100),
    telefono varchar(40),
	esActivo bit,
    fechaRegistro datetime default getdate()
)


go 
create table Producto (
idProducto int primary key identity(1,1),
codigo varchar(100) unique,
marca varchar(100),
descripcion varchar(200),
idCategoria int references Categoria(idCategoria),
idProveedor int references Proveedor(idProveedor),
stock int,
precio decimal(10,2),
esActivo bit,
fechaRegistro datetime default getdate()
)

go

create table Venta(
idVenta int primary key identity(1,1),
numeroDocumento varchar(40),
tipoDocumento varchar(50),
fechaRegistro datetime default getdate(),
idUsuario int references Usuario(idUsuario),
documentoCliente varchar(40),
nombreCliente varchar(100),
subTotal decimal(10,2),
impuestoTotal decimal(10,2),
total decimal(10,2),
)

go

create table DetalleVenta(
idDetalleVenta int primary key identity(1,1),
idVenta int references Venta(idVenta),
idProducto int references Producto(idProducto),
cantidad int,
precio decimal(10,2),
total decimal(10,2)
)

go

create table NumeroDocumento(
id int primary key,
fechaRegistro datetime default getdate()
)
go


