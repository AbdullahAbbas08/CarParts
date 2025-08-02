using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.DTOs
{
    public class UploadDTO
    {
        public string? FileName { get; set; }
        public string? FileSize { get; set; }
        public bool Successfully_Uploaded { get; set; } = false;
        public bool Successfully_Deleted {get; set; } = false;
        public string? Message { get; set; }
    }
}
