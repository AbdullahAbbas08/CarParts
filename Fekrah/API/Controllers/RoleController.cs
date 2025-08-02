using Bussiness.IService;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : _BaseController<Role, RoleDTO>
    {
        public RoleController(IRoleService roleService) : base(roleService)
        {
            
        }
    }
}
