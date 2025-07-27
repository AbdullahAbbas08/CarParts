using Microsoft.Extensions.DependencyInjection;
using Bussiness.Interfaces;
using Bussiness.Services;

namespace Bussiness.Services
{
    public static class _ServicesRegistration
    {
        public static void RegisterServicesConfiguration(this IServiceCollection services)
        {
            // ...existing registrations...
            services.AddScoped<ILookupService, LookupService>();
        }
    }
}
