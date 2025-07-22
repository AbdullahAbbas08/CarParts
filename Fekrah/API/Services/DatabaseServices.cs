using Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public static partial class ServicesRegistration
    {
        public static void AddDatabaseContext(this IServiceCollection services, string connectionString)
        {

            services.AddEntityFrameworkSqlServer().AddDbContext<DatabaseContext>(options =>
            {
                options.UseLazyLoadingProxies(false)
                .UseSqlServer(connectionString, serverDbContextOptionsBuilder =>
                {
                    int minutes = (int)TimeSpan.FromMinutes(3).TotalSeconds;
                    serverDbContextOptionsBuilder.CommandTimeout(minutes);
                    serverDbContextOptionsBuilder.EnableRetryOnFailure();
                });
            });
        }

        public static void DatabaseMigration(this IServiceCollection services)
        {
            //IServiceProvider serviceProvider = services.BuildServiceProvider();
        }

        public static async void DatabaseInitialData(this IServiceCollection services)
        {
            IServiceProvider serviceProvider = services.BuildServiceProvider();
            IUnitOfWork uow = serviceProvider.GetService<IUnitOfWork>();

          
        }
    }
}
