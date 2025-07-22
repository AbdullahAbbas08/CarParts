using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CityController : _BaseController<City, CityDto>
    {
        public CityController(ICityService cityService) : base(cityService)
        {
            
        }
    }
}
