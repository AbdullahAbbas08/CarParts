using Bussiness.IService;
using Data.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Bussiness.Services
{
    public class FileService : IFileService
    {
        private readonly string _webRootPath;
        private readonly IConfiguration _configuration;

        public FileService(IConfiguration configuration, IHostingEnvironment webHostEnvironment)
        {
            _webRootPath = webHostEnvironment.ContentRootPath;
            _configuration = configuration;
        }

        public string SaveFile(IFormFile file, FileTypeEnum fileType)
        {
            if (file == null) return null;
            var fileName = $"{Guid.NewGuid()}_{Enum.GetName(fileType)}_{Path.GetFileName(file.FileName)}";

            string? _mainImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Main").Value;
            string? _backupImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Backup").Value;

            var mainPath = Path.Combine(_webRootPath, _mainImagePath, fileName);
            var backupPath = Path.Combine(_webRootPath, _backupImagePath, fileName);

            var mainDir = Path.GetDirectoryName(mainPath);
            var backupDir = Path.GetDirectoryName(backupPath);

            if (!Directory.Exists(mainDir))
                Directory.CreateDirectory(mainDir);
            if (!Directory.Exists(backupDir))
                Directory.CreateDirectory(backupDir);

            using (var stream = new FileStream(mainPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
            using (var stream = new FileStream(backupPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return fileName.Replace("\\", "/");
        }
    }
}
