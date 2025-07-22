using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerCategoryController : _BaseController<SellerCategory, SellerCategoryDto>
    {
        public SellerCategoryController(ISellerCategoryService sellerCategoryService) : base(sellerCategoryService)
        {
            
        }
    }
}
