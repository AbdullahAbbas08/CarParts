using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarsModelController : _BaseController<CarsModel, CarsModelDto>
    {
        public CarsModelController(ICarsModelService carsModelService) : base(carsModelService)
        {
            
        }
    }
}
