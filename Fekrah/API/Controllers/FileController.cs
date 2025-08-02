using Bussiness.IService;
using Data.DTOs;
using Data.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FileController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("UploadFile")]
        public UploadDTO UploadFile(IFormFile file, FileTypeEnum fileType) =>
            _fileService.SaveFile(file, fileType);

        [HttpPost("DeleteFile")]
        public UploadDTO DeleteFile(string fileName, FileTypeEnum fileType) =>
            _fileService.DeleteFile(fileName, fileType);
    }
}
