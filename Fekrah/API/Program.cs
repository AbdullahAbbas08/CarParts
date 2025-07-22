using API.Middlewares;
using Microsoft.EntityFrameworkCore;
using Api.Services;
using Data;
using Bussiness.Interfaces;
using Bussiness.Profilers;
using Bussiness.Helpers;

var builder = WebApplication.CreateBuilder(args);

// Docker: Read correct config based on environment
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Large file upload size limit (Kestrel)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 10L * 1024 * 1024 * 1024; // 10 GB
});

// Binding Configuration
builder.Services.Configure<JWTSetting>(builder.Configuration.GetSection("BearerTokens"));

// AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<ApplicationProfile>(), AppDomain.CurrentDomain.GetAssemblies());

// Custom App Services
builder.RegisterAppReuiredServices();

// Controllers + JSON settings
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

// Dependency Injection
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Build app
var app = builder.Build();

// Middleware pipeline (استخدم app.Environment مباشرة)
app.ConfigureHTTPRequestPipeline( app.Configuration);

app.Run();
