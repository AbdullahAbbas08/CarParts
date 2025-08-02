using Bussiness.IService;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : _BaseController<Permission, PermissionDTO>
    {
        public PermissionController(IPermissionService permissionService) : base(permissionService)
        {
            
        }
    }
}
