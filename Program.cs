using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using Microsoft.AspNetCore.ResponseCompression;
using ReactVentas.Services;
using ReactVentas.Interfaces;
using ReactVentas.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.  

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<DBREACT_VENTAContext>(options => {
    options.UseSqlServer(builder.Configuration.GetConnectionString("cadenaSQL"));
});

// Configuraci�n CORS para permitir acceso desde dispositivos m�viles  
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// Agregar compresi�n de respuesta para mejorar rendimiento en conexiones m�viles  
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});

// Registrar servicio de contrase�as
builder.Services.AddScoped<IPasswordService, PasswordService>();

// Registrar repositorios
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IProveedorRepository, ProveedorRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();

builder.Services.AddControllers().AddJsonOptions(option =>
{
    option.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

// Configure the HTTP request pipeline.  
if (!app.Environment.IsDevelopment())
{
    // En producci�n, puedes agregar manejo de errores espec�fico  
    app.UseExceptionHandler("/Error");
    app.UseHsts(); // Habilitar HSTS para conexiones seguras  
}

// Habilitar compresi�n de respuesta  
app.UseResponseCompression();

// Habilitar CORS  
app.UseCors("AllowAll");

// Habilitar HTTPS Redirection para seguridad en dispositivos m�viles  
app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();

// Agregar autenticaci�n y autorizaci�n si es necesario  
// app.UseAuthentication();  
// app.UseAuthorization();  

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();