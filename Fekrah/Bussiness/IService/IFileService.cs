using Data.DTOs;
using Data.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.IService
{
    public interface IFileService
    {
        UploadDTO SaveFile(IFormFile formFile, FileTypeEnum fileType);
        UploadDTO DeleteFile(string fileName, FileTypeEnum fileType);
    }
}
