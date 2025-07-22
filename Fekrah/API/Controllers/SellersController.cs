using API.Controllers;
using Bussiness.Helpers;
using Data.DTOs;
using Data.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class SellersController : _BaseController<Seller, SellerDto>
{
    private readonly ISellerService _sellerService;

    public SellersController(ISellerService sellerService) : base(sellerService)
    {
        _sellerService = sellerService;
    }

    [HttpGet("GetAllFilteredSeller")]
    public DataSourceResult<SellerDto> GetAllFilteredSeller([FromQuery]SellerFilterViewModel sellerFilterViewModel) =>
        _sellerService.GetAllFilteredSeller(sellerFilterViewModel);
}
