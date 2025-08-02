using API.Services;
using Data;

namespace API.Middlewares.Middlewares
{
    public static partial class _Pipeline
    {
        // Only one SeedData method should exist in this partial class
        public static void SeedData(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var dbContext = services.GetRequiredService<DatabaseContext>();
                ServicesRegistration.SeedGovernorates(dbContext).GetAwaiter().GetResult();
                ServicesRegistration.SeedCities(dbContext).GetAwaiter().GetResult();
                ServicesRegistration.SeedCategories(dbContext).GetAwaiter().GetResult();
                ServicesRegistration.SeedRoles(dbContext).GetAwaiter().GetResult();
            }
        }
    }
}
