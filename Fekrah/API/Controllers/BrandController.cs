using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandController : _BaseController<Brand, BrandDTO>
    {
        public BrandController(ICarsModelService carsModelService) : base(carsModelService)
        {
            
        }
    }
}
