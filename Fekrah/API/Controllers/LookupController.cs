using Bussiness.Interfaces;
using Data.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookupController : ControllerBase
    {
        private readonly ILookupService _lookupService;

        public LookupController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("GetLookup")]
        public List<LookupDTO> GetLookupData(string lookupName, string? searchTerm = null) => _lookupService.GetLookUpDetails(lookupName, searchTerm);

        [HttpGet("Governorates")]
        public ActionResult<List<GovernorateLookupDto>> GetGovernorates()
            => _lookupService.GetGovernorates();

        [HttpGet("Cities")]
        public ActionResult<List<CityLookupDto>> GetCities([FromQuery] int? governorateId = null)
            => _lookupService.GetCities(governorateId);
    }
}
