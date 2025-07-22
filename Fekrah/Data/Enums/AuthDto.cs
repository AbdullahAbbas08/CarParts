using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Enums
{
    public class AuthDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Photo { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }
        public int? StatusCode { get; set; }
        public bool IsAuthenticated { get; set; } = false;
        public bool IsAdmin { get; set; } = false;
        public UserTypeEnum UserType { get; set; }
    }
}
