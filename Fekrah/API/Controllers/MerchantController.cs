using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class MerchantController : _BaseController<Merchant, MerchantDTO>
{
    private readonly ISellerService _sellerService;

    public MerchantController(ISellerService sellerService) : base(sellerService)
    {
        _sellerService = sellerService;
    }


}
