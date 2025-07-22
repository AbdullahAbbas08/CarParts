using Data.Interfaces;
using System.Security.Claims;

namespace Data.Services
{
    public class SessionService : ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SessionService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }


        public HttpContext HttpContext
        {
            get { return _httpContextAccessor.HttpContext; }
            set { _httpContextAccessor.HttpContext = value; }
        }

        public string? UserId
        {
            get
            {
                if (HttpContext.User is null)
                    return null;

                var claim = HttpContext.User.FindFirst(ClaimTypes.UserData);
                if (claim is null)
                    return null;

                return claim.Value;
            }
        }

        public string? UserName
        {
            get
            {
                if (HttpContext is null)
                    return null;

                var claim = HttpContext.User.FindFirst(ClaimTypes.Name);

                if (claim is null)
                    return null;

                return claim.Value;
            }
        }

        public int? UserType
        {
            get
            {
                if (HttpContext.User is null)
                    return null;

                var claim = HttpContext.User.FindFirst("UserType");
                if (claim is null)
                    return null;

                return int.Parse(claim.Value);
            }
        }
    }
}
