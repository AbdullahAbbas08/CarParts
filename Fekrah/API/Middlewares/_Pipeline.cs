using API.Middlewares.Middlewares;
using API.Services;

namespace API.Middlewares
{
    public static class _Pipeline
    {
        public static void ConfigureHTTPRequestPipeline(this WebApplication app, IConfiguration Configuration)
        {
            app.MapControllers();
            app.UseSession();
            //app.UseHttpsRedirection();
            app.UseStaticFiles();

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseFileServer(new FileServerOptions() { EnableDirectoryBrowsing = false });

            app.UseCors(SwaggerServices.CorsAllowedOriginsPolicyName);
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            if (app.Environment.IsDevelopment())
            {
                app.Swagger();
                app.SinglePageApp(app.Environment, Configuration);
            }
        }
    }
}
