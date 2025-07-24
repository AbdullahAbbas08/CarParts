using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class MerchantController : _BaseController<Merchant, MerchantDTO>
{
    private readonly IMerchantService _sellerService;

    public MerchantController(IMerchantService sellerService) : base(sellerService)
    {
        _sellerService = sellerService;
    }


}
