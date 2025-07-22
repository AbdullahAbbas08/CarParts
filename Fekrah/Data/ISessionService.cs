using Microsoft.AspNetCore.Http;

namespace Data.Interfaces
{
    public interface ISessionService
    {
        HttpContext HttpContext { get; set; }
        string? UserId { get; }
        string? UserName { get; }
        int? UserType { get; }
    }
}
 