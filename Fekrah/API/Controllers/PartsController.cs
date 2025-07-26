using API.Controllers;
using Bussiness.Helpers;
using Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class PartsController : _BaseController<Part, PartDTO>
{
    private readonly IPartService _partService;

    public PartsController(IPartService partService) : base(partService)
    {
        _partService = partService;
    }

    [HttpPost("AdvancedSearchPart")]
    public DataSourceResult<PartDTO> AdvancedSearch(PartFilterViewModel part, int page, int pageSize)
        => _partService.AdvancedSearch(part, page, pageSize);
}
