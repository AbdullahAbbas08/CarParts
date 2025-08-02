using Bussiness.IService;
using Data.DTOs;
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
        private readonly List<string> fileExtenstion = new List<string>() { ".png", ".jpg", ".jpeg" };
        private readonly long maxFileSize = 2097152; // Max Allowed Size is 2MB

        public FileService(IConfiguration configuration, IHostingEnvironment webHostEnvironment)
        {
            _webRootPath = webHostEnvironment.ContentRootPath;
            _configuration = configuration;
        }

        public UploadDTO SaveFile(IFormFile file, FileTypeEnum fileType)
        {
            UploadDTO response = new();

            if (file == null) return null;
            var fileName = $"{Guid.NewGuid()}_{Enum.GetName(fileType)}_{Path.GetFileName(file.FileName)}";
            var fileExtension = Path.GetExtension(file.FileName);

            if (!fileExtenstion.Any(e => e == fileExtension.ToLower()))
                return new UploadDTO{ Message = "الملفات المسموح بها .png, .jpg, .jpeg" };

            if (file.Length > maxFileSize)
                return new UploadDTO { Message = "حجم الملف المسموح به أقل من أو يساوي 2 ميجا" };

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

            double fileSizeInMB = (file.Length / 1024d) / 1024d;

            response.FileName = fileName.Replace("\\", "/");
            response.FileSize = $"{Math.Round(fileSizeInMB, 2)} MB";
            response.Successfully_Uploaded = true;
            response.Message = "تم رفع الصورة بنجاح .";

            return response; ;
        }

        public UploadDTO DeleteFile(string fileName, FileTypeEnum fileType)
        {
            string? _mainImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Main").Value;
            string? _backupImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Backup").Value;

            var mainPath = Path.Combine(_webRootPath, _mainImagePath, fileName);
            var backupPath = Path.Combine(_webRootPath, _backupImagePath, fileName);

            if (!Path.Exists(mainPath)) return new UploadDTO { Message = "هذا الملف غير صحيح .", FileName = fileName };

            File.Delete(mainPath);
            File.Delete(backupPath);

            return new UploadDTO { Message = "تم حذف الملف بنجاح", FileName = fileName, Successfully_Deleted = true};
        }
    }
}
