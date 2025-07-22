using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Services
{
    public static partial class ServicesRegistration
    {
        public static void RegisterAppReuiredServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddHttpContextAccessor();
            builder.Services.RegisterRepositoriesConfiguration();
            builder.Services.RegisterServicesConfiguration();

            // Session and TempData
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession(opt =>
            {
                opt.Cookie.IsEssential = true;
            });
            builder.Services.Configure<CookieTempDataProviderOptions>(options =>
            {
                options.Cookie.IsEssential = true;
            });

            builder.Services.AddMvc();

            // Swagger
            builder.Services.ConfigureSwagger();

            // Database Connection
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDatabaseContext(connectionString);
            builder.Services.DatabaseMigration();
            builder.Services.DatabaseInitialData();

            // Caching
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpClient();

            // Authentication
            builder.Services.ConfigureAuthentication(builder.Configuration);
            builder.Services.AddAuthorizationPolicies();

            // CORS
            builder.Services.AddCorsFromConfiguration(builder.Configuration);

            // ONLY if you still want to serve Angular from backend
            if (!builder.Environment.IsEnvironment("Docker"))
            {
                builder.Services.AddSpaStaticFiles(configuration =>
                {
                    configuration.RootPath = "wwwroot";
                });
            }
        }
    }
}
