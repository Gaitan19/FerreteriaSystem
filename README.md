# Sistema de Ferretería "La Unión"

Sistema integral de gestión para ferretería desarrollado con ASP.NET Core 8.0 y React. Permite administrar productos, categorías, proveedores, usuarios, ventas y generar reportes.

## 📋 Tabla de Contenidos

- [Descripción del Sistema](#descripción-del-sistema)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Base de Datos](#base-de-datos)
- [Requerimientos del Sistema](#requerimientos-del-sistema)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Uso del Sistema](#uso-del-sistema)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Contribución](#contribución)

## 🏪 Descripción del Sistema

El Sistema de Ferretería "La Unión" es una aplicación web completa diseñada para automatizar y gestionar las operaciones diarias de una ferretería. El sistema permite un control integral del inventario, ventas, proveedores y usuarios con diferentes niveles de acceso.

### Funcionalidades Principales:
- **Gestión de Inventario**: Control completo de productos, categorías y stock
- **Gestión de Proveedores**: Administración de información de proveedores
- **Sistema de Ventas**: Procesamiento de ventas con generación de facturas
- **Control de Usuarios**: Sistema de roles y permisos
- **Reportes y Análisis**: Dashboard con métricas y reportes de ventas
- **Historial de Transacciones**: Seguimiento completo de todas las operaciones

## ✨ Características Principales

### Para Administradores:
- Dashboard con métricas y gráficos en tiempo real
- Gestión completa de usuarios y roles
- Administración de productos, categorías y proveedores
- Acceso a todos los reportes y estadísticas
- Control de inventario y stock

### Para Usuarios de Ventas:
- Procesamiento de ventas
- Consulta de productos y precios
- Generación de facturas
- Historial de ventas

### Características Técnicas:
- Interfaz responsiva compatible con dispositivos móviles
- Conexión en tiempo real con SignalR
- Autenticación y autorización segura
- Validación de datos en frontend y backend
- Impresión de facturas y reportes

## 🏗️ Arquitectura del Sistema

### Backend (ASP.NET Core 8.0)
```
├── Controllers/           # Controladores de API
├── Models/               # Modelos de datos y DTOs
├── Services/             # Lógica de negocio
├── Repositories/         # Acceso a datos
├── Hubs/                # SignalR Hubs
└── Interfaces/          # Contratos e interfaces
```

### Frontend (React)
```
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── views/          # Páginas principales
│   ├── context/        # Context API (estado global)
│   ├── services/       # Servicios de API
│   └── utils/          # Utilidades
```

## 🗃️ Base de Datos

El sistema utiliza SQL Server con la siguiente estructura:

### Tablas Principales:

#### 1. **Rol**
- `idRol` (int, PK) - Identificador único del rol
- `descripcion` (varchar(100)) - Nombre del rol (Administrador, Vendedor)
- `esActivo` (bit) - Estado del rol
- `fechaRegistro` (datetime) - Fecha de creación

#### 2. **Usuario**
- `idUsuario` (int, PK) - Identificador único del usuario
- `nombre` (varchar(80)) - Nombre completo del usuario
- `correo` (varchar(80), UNIQUE) - Email del usuario (login)
- `telefono` (varchar(40)) - Teléfono de contacto
- `idRol` (int, FK) - Referencia al rol
- `clave` (varchar(200)) - Contraseña encriptada
- `esActivo` (bit) - Estado del usuario

#### 3. **Categoria**
- `idCategoria` (int, PK) - Identificador único de la categoría
- `descripcion` (varchar(80)) - Nombre de la categoría
- `esActivo` (bit) - Estado de la categoría
- `fechaRegistro` (datetime) - Fecha de creación

#### 4. **Proveedor**
- `idProveedor` (int, PK) - Identificador único del proveedor
- `nombre` (varchar(100)) - Nombre del proveedor
- `correo` (varchar(100)) - Email del proveedor
- `telefono` (varchar(40)) - Teléfono del proveedor
- `esActivo` (bit) - Estado del proveedor
- `fechaRegistro` (datetime) - Fecha de registro

#### 5. **Producto**
- `idProducto` (int, PK) - Identificador único del producto
- `codigo` (varchar(100), UNIQUE) - Código único del producto
- `marca` (varchar(100)) - Marca del producto
- `descripcion` (varchar(200)) - Descripción del producto
- `idCategoria` (int, FK) - Referencia a la categoría
- `idProveedor` (int, FK) - Referencia al proveedor
- `stock` (int) - Cantidad disponible
- `precio` (decimal(10,2)) - Precio de venta
- `esActivo` (bit) - Estado del producto
- `fechaRegistro` (datetime) - Fecha de registro

#### 6. **Venta**
- `idVenta` (int, PK) - Identificador único de la venta
- `numeroDocumento` (varchar(40)) - Número de factura
- `tipoDocumento` (varchar(50)) - Tipo de documento
- `fechaRegistro` (datetime) - Fecha de la venta
- `idUsuario` (int, FK) - Usuario que realizó la venta
- `documentoCliente` (varchar(40)) - Documento del cliente
- `nombreCliente` (varchar(100)) - Nombre del cliente
- `subTotal` (decimal(10,2)) - Subtotal de la venta
- `impuestoTotal` (decimal(10,2)) - Total de impuestos
- `total` (decimal(10,2)) - Total de la venta

#### 7. **DetalleVenta**
- `idDetalleVenta` (int, PK) - Identificador único del detalle
- `idVenta` (int, FK) - Referencia a la venta
- `idProducto` (int, FK) - Referencia al producto
- `cantidad` (int) - Cantidad vendida
- `precio` (decimal(10,2)) - Precio unitario
- `total` (decimal(10,2)) - Total del item

#### 8. **NumeroDocumento**
- `id` (int, PK) - Número de documento
- `fechaRegistro` (datetime) - Fecha de generación

### Relaciones:
- Usuario → Rol (Muchos a Uno)
- Producto → Categoria (Muchos a Uno)
- Producto → Proveedor (Muchos a Uno)
- Venta → Usuario (Muchos a Uno)
- DetalleVenta → Venta (Muchos a Uno)
- DetalleVenta → Producto (Muchos a Uno)

## 🔧 Requerimientos del Sistema

### Software Necesario:
- **.NET 8.0 SDK** - Framework de desarrollo backend
- **Node.js** (versión 16 o superior) - Para el frontend React
- **SQL Server** - Base de datos (puede ser SQL Server Express, LocalDB o instancia completa)
- **Visual Studio 2022** o **VS Code** - IDE recomendado
- **Git** - Control de versiones

### Hardware Mínimo:
- **Procesador**: Intel i3 o AMD equivalente
- **Memoria RAM**: 4 GB mínimo (8 GB recomendado)
- **Espacio en Disco**: 1 GB para el proyecto
- **Conexión a Internet**: Para dependencias y actualizaciones

### Navegadores Compatibles:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Gaitan19/FerreteriaSystem.git
cd FerreteriaSystem
```

### 2. Configurar la Base de Datos
```sql
-- Ejecutar el script de base de datos
-- Archivo: consultas/database.sql
```

### 3. Instalar Dependencias del Backend
```bash
# En la raíz del proyecto
dotnet restore
```

### 4. Instalar Dependencias del Frontend
```bash
# Navegar a la carpeta del cliente
cd ClientApp
npm install
```

### 5. Configurar Connection String
Editar `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "cadenaSQL": "Server=.;Database=DBREACT_VENTA;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  }
}
```

## ⚙️ Configuración

### Configuración de Base de Datos Local:
1. Instalar SQL Server o SQL Server Express
2. Ejecutar el script `consultas/database.sql`
3. Crear datos iniciales (roles, usuario administrador)
4. Actualizar la cadena de conexión en `appsettings.json`

### Configuración de Desarrollo:
```bash
# Ejecutar el proyecto
dotnet run
```
El sistema estará disponible en: `http://localhost:5145` o `https://localhost:7145`

### Variables de Entorno (Opcional):
```bash
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5145
```

## 🚀 Despliegue

### Despliegue Local:
```bash
# Compilar para producción
dotnet publish -c Release

# Ejecutar
dotnet ./bin/Release/net8.0/publish/ReactVentas.dll
```

### Despliegue en Hosting (Somee.com):
El sistema está configurado para usar hosting gratuito de Somee:

1. **Base de Datos**: Utiliza SQL Server en Somee
2. **Configuración**: 
   ```json
   "cadenaSQL": "workstation id=DBREACT_VENTA.mssql.somee.com;packet size=4096;user id=vhromero_SQLLogin_1;pwd=m5zmtmub73;data source=DBREACT_VENTA.mssql.somee.com;persist security info=False;initial catalog=DBREACT_VENTA;TrustServerCertificate=True"
   ```
3. **URL del Sistema**: [Sistema en Somee](http://ferreteriasystem.somee.com)

### Otros Hostings:
- **Azure App Service**
- **AWS Elastic Beanstalk**  
- **Google Cloud Platform**
- **IIS Server** (Windows Server)

## 💻 Uso del Sistema

### Inicio de Sesión:
1. Acceder a la página principal
2. Ingresar credenciales (email y contraseña)
3. El sistema redirige según el rol del usuario

### Navegación:
- **Sidebar**: Menú principal con módulos del sistema
- **Topbar**: Información del usuario y logout
- **Breadcrumbs**: Navegación contextual

### Módulos Principales:

#### 📊 Dashboard (Solo Administradores)
- Métricas generales del sistema
- Gráficos de ventas por período
- Productos más vendidos
- Indicadores clave de rendimiento

#### 👥 Gestión de Usuarios (Solo Administradores)
- Crear, editar y eliminar usuarios
- Asignar roles y permisos
- Activar/desactivar cuentas
- Cambio de contraseñas

#### 📦 Gestión de Inventario
**Productos:**
- Agregar nuevos productos
- Editar información de productos
- Control de stock
- Precios y categorías

**Categorías:**
- Crear categorías de productos
- Organizar inventario
- Activar/desactivar categorías

**Proveedores:**
- Registrar proveedores
- Información de contacto
- Historial de suministros

#### 💰 Módulo de Ventas
**Nueva Venta:**
- Selección de productos
- Cálculo automático de totales
- Información del cliente
- Generación de factura

**Historial de Ventas:**
- Consulta de ventas anteriores
- Filtros por fecha y usuario
- Detalles de transacciones
- Reimpresión de facturas

#### 📈 Reportes
- Reportes de ventas por período
- Análisis de productos más vendidos
- Reportes de inventario
- Exportación a Excel/PDF

## 📱 Capturas de Pantalla

### Pantalla de Login
![Login](screenshots/login_screen.png)

*Pantalla de inicio de sesión con validación de credenciales. Permite el acceso al sistema mediante email y contraseña.*

### Dashboard Principal (Administrador)
![Dashboard](screenshots/dashboard_mock.html)

*Panel principal que muestra métricas clave:*
- Cantidad total de ventas
- Ingresos generados
- Total de productos en inventario
- Número de categorías
- Gráficos de ventas por período
- Productos más vendidos

### Gestión de Productos
*Módulo completo para administrar el inventario:*
- Lista de productos con filtros de búsqueda
- Formulario de creación/edición de productos
- Control de stock y precios
- Asignación de categorías y proveedores
- Estados activo/inactivo

### Gestión de Categorías
*Organización del inventario por categorías:*
- Lista de categorías existentes
- Creación de nuevas categorías
- Edición de categorías existentes
- Control de estado (activo/inactivo)

### Gestión de Proveedores
*Administración de proveedores:*
- Registro de nuevos proveedores
- Información de contacto completa
- Historial de suministros
- Estados de proveedores

### Módulo de Ventas
*Procesamiento de ventas:*
- Interfaz intuitiva para crear ventas
- Búsqueda rápida de productos
- Cálculo automático de totales
- Captura de datos del cliente
- Generación inmediata de facturas

### Historial de Ventas
*Consulta y gestión de ventas anteriores:*
- Lista completa de transacciones
- Filtros por fecha, usuario y cliente
- Vista detallada de cada venta
- Opción de reimpresión de facturas

### Gestión de Usuarios (Administrador)
*Control de acceso al sistema:*
- Lista de usuarios registrados
- Creación de nuevos usuarios
- Asignación de roles y permisos
- Activación/desactivación de cuentas
- Cambio de contraseñas

### Reportes y Análisis
*Módulo de reportes:*
- Reportes de ventas por período
- Análisis de rendimiento
- Productos más vendidos
- Exportación de datos

## 🔐 Credenciales de Prueba

Para probar el sistema, utiliza las siguientes credenciales:

```
Email: victorR@gmail.com
Contraseña: 123
```

**Nota**: Este usuario tiene permisos de administrador, por lo que tendrá acceso a todas las funcionalidades del sistema.

### Roles en el Sistema:
- **Administrador**: Acceso completo a todos los módulos
- **Vendedor**: Acceso limitado a ventas y consultas

## 🛠️ Tecnologías Utilizadas

### Backend:
- **ASP.NET Core 8.0** - Framework web
- **Entity Framework Core** - ORM para base de datos
- **SQL Server** - Sistema de gestión de base de datos
- **SignalR** - Comunicación en tiempo real
- **BCrypt.Net** - Encriptación de contraseñas

### Frontend:
- **React 18** - Biblioteca de interfaz de usuario
- **React Router** - Navegación SPA
- **Reactstrap/Bootstrap** - Framework de CSS
- **Chart.js** - Gráficos y visualizaciones
- **SweetAlert2** - Alertas y notificaciones
- **React-to-Print** - Impresión de documentos

### Dependencias Principales:
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.3.0",
  "reactstrap": "^8.9.0",
  "bootstrap": "^4.6.0",
  "react-chartjs-2": "^4.2.0",
  "sweetalert2": "^11.4.19",
  "react-to-print": "^2.15.1",
  "@microsoft/signalr": "^8.0.7"
}
```

### Herramientas de Desarrollo:
- **Visual Studio 2022** / **VS Code**
- **Git** - Control de versiones
- **npm** - Gestor de paquetes
- **Postman** - Testing de APIs

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código:
- Seguir convenciones de C# y JavaScript
- Documentar funciones complejas
- Incluir pruebas unitarias cuando sea posible
- Mantener código limpio y legible

### Reportar Bugs:
- Usar el sistema de Issues de GitHub
- Incluir pasos para reproducir el error
- Especificar entorno y versión del navegador

---

**Desarrollado por**: Equipo de Desarrollo Ferretería La Unión  
**Versión**: 1.0.0  
**Licencia**: MIT  
**Última Actualización**: Agosto 2024

Para más información o soporte técnico, contactar al equipo de desarrollo.
