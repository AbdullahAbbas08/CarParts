using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class BrandController : _BaseController<Brand, BrandDTO>
    {
        private readonly IBrandService _brandService;

        public BrandController(IBrandService brandService) : base(brandService)
        {
            _brandService = brandService;
        }


        /// <summary>
        /// Activates or deactivates a brand.
        /// </summary>
        /// <param name="brandId">The unique identifier of the brand to update.</param>
        /// <param name="action">
        /// Determines the action to perform:  
        /// - true → Activate the brand  
        /// - false → Deactivate the brand
        /// </param>
        /// <returns>
        /// true if the operation succeeded, otherwise false.
        /// </returns>
        [HttpPost("ActiveOrDeactiveBrand")]
        public bool ActiveOrDeactiveBrand(int brandId, bool action) => _brandService.ActiveOrDeactiveBrand(brandId, action);
    }
}
