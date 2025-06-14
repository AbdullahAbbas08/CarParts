﻿using API.Services;
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
            //builder.Services.AddRotativa();



            builder.Services.ConfigureSwagger();
            builder.Services.AddDatabaseContext(builder.Configuration.GetConnectionString("DefaultConnection"));
            //builder.Services.Configure<AppSettings>(options => builder.Configuration.Bind(options));
            //builder.Services.ConfigureHangfire(builder.Configuration.GetConnectionString("DefaultConnection"));
            builder.Services.DatabaseMigration();
            builder.Services.DatabaseInitialData();
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpClient();
            //builder.Services.AddHangfireServer(options =>{ options.Queues = HangfireHelper.GetQueues(); });
            builder.Services.ConfigureAuthentication(builder.Configuration);
            builder.Services.AddAuthorizationPolicies();
            builder.Services.AddCorsFromConfiguration(builder.Configuration);
            builder.Services.AddSpaStaticFiles(configuration => { configuration.RootPath = "wwwroot"; });
        }
    }
}
