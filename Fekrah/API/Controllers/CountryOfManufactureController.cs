using Bussiness.IService;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class CountryOfManufactureController : _BaseController<CountryOfManufacture, CountryOfManufactureDTO>
    {
        public CountryOfManufactureController(ICountryOfManufactureService Service) : base(Service)
        {
             
        }
    }
}
