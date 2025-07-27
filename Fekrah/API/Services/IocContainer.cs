using Bussiness.Interfaces;
using Bussiness.Services;
using Data;
using Data.Interfaces;
using Data.IRepositories;
using Data.Repositories;
using Data.Services;

namespace Api.Services
{
    public static partial class ServicesRegistration
    {
        public static void RegisterServicesConfiguration(this IServiceCollection services)
        {
            services.AddScoped<ISessionService, SessionService>();
            services.AddScoped<IPartService, PartService>();
            services.AddScoped<IMerchantService, MerchantService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ILookupService, LookupService>();
            services.AddScoped<ICarsModelService, CarsModelService>();
            services.AddScoped<ICityService, CityService>();
            services.AddScoped<IMerchantCategoryService, MerchantCategoryService>();
            services.AddScoped<IModelTypeService, ModelTypeService>();
        }

        public static void RegisterRepositoriesConfiguration(this IServiceCollection services)
        {
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IPartRepository, PartRepository>();
            services.AddScoped<ISellerRepository, SellerRepository>();
            services.AddScoped<ICarsModelRepository, CarsModelRepository>();
        }
    }
}
