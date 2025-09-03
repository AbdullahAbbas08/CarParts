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

        public List<UploadDTO> SaveFile(IEnumerable<IFormFile> formFile, FileTypeEnum fileType)
        {
            var responses = new List<UploadDTO>();
            if (formFile == null || !formFile.Any())
            {
                responses.Add(new UploadDTO { Message = "الملف غير موجود" });
                return responses;
            }

            string? _mainImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Main").Value;
            string? _backupImagePath = _configuration.GetSection($"ApplicationImagePaths:{Enum.GetName(fileType)}:Backup").Value;

            foreach (var file in formFile)
            {
                if (file == null)
                {
                    responses.Add(new UploadDTO { Message = "الملف غير موجود" });
                    continue;
                }

                var fileName = $"{Guid.NewGuid()}_{Enum.GetName(fileType)}_{Path.GetFileName(file.FileName)}";
                var fileExtension = Path.GetExtension(file.FileName);

                if (!fileExtenstion.Any(e => e == fileExtension.ToLower()))
                {
                    responses.Add(new UploadDTO { Message = "الملفات المسموح بها .png, .jpg, .jpeg" });
                    continue;
                }

                if (file.Length > maxFileSize)
                {
                    responses.Add(new UploadDTO { Message = "حجم الملف المسموح به أقل من أو يساوي 2 ميجا" });
                    continue;
                }

                var mainPath = Path.Combine(_webRootPath, _mainImagePath, fileName);
                var backupPath = Path.Combine(_webRootPath, _backupImagePath, fileName);

                var mainDir = Path.GetDirectoryName(mainPath);
                var backupDir = Path.GetDirectoryName(backupPath);

                if (!Directory.Exists(mainDir))
                    Directory.CreateDirectory(mainDir);
                if (!Directory.Exists(backupDir))
                    Directory.CreateDirectory(backupDir);

                // رفع الملف الرئيسي
                using (var stream = new FileStream(mainPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                responses.Add(new UploadDTO
                {
                    FileName = fileName.Replace("\\", "/"),
                    FileSize = $"{Math.Round((file.Length / 1024d) / 1024d, 2)} MB",
                    Successfully_Uploaded = true,
                    Message = "تم رفع الصورة بنجاح (رئيسي) ."
                });

                // رفع النسخة الاحتياطية
                using (var stream = new FileStream(backupPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                responses.Add(new UploadDTO
                {
                    FileName = fileName.Replace("\\", "/"),
                    FileSize = $"{Math.Round((file.Length / 1024d) / 1024d, 2)} MB",
                    Successfully_Uploaded = true,
                    Message = "تم رفع الصورة بنجاح (احتياطي) ."
                });
            }

            return responses;
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
