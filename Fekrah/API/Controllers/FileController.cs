using Bussiness.IService;
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
        public string UploadFile(IFormFile file, FileTypeEnum fileTypeEnum) => _fileService.SaveFile(file, fileTypeEnum);
    }
}
