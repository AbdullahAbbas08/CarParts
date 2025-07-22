using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class PartsController : _BaseController<Part, PartDTO>
{
    public PartsController(IPartService partService) : base(partService)
    {
        
    }
}
