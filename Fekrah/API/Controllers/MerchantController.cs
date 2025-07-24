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

    [HttpGet, Route("GetDetails")]
    public override MerchantDTO GetDetails(int id)
    {
        return _sellerService.GetById(id);
    }

    [HttpPost, Route("Insert")]
    public override MerchantDTO Insert([FromBody] MerchantDTO entity)
    {
        return _sellerService.Insert(entity);
    }

    [HttpPost, Route("Update")]
    public override MerchantDTO Update([FromBody] MerchantDTO entity)
    {
        return _sellerService.Update(entity);
    }

    [HttpPost, Route("Delete")]
    public override MerchantDTO Delete(int id)
    {
        return _sellerService.Delete(id);
    }
}
