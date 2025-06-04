using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.  

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<DBREACT_VENTAContext>(options => {
    options.UseSqlServer(builder.Configuration.GetConnectionString("cadenaSQL"));
});

// Configuración CORS para permitir acceso desde dispositivos móviles  
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// Agregar compresión de respuesta para mejorar rendimiento en conexiones móviles  
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.AddControllers().AddJsonOptions(option =>
{
    option.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

// Configure the HTTP request pipeline.  
if (!app.Environment.IsDevelopment())
{
    // En producción, puedes agregar manejo de errores específico  
    app.UseExceptionHandler("/Error");
    app.UseHsts(); // Habilitar HSTS para conexiones seguras  
}

// Habilitar compresión de respuesta  
app.UseResponseCompression();

// Habilitar CORS  
app.UseCors("AllowAll");

// Habilitar HTTPS Redirection para seguridad en dispositivos móviles  
app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();

// Agregar autenticación y autorización si es necesario  
// app.UseAuthentication();  
// app.UseAuthorization();  

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();