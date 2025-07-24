using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[AllowAnonymous]
[Route("api/[controller]")]
[ApiController]
public class MerchantController : _BaseController<Merchant, MerchantDTO>
{
    private readonly IMerchantService _merchantService;

    public MerchantController(IMerchantService merchantService) : base(merchantService)
    {
        _merchantService = merchantService;
    }

    //[HttpPost]
    //public  ActionResult<MerchantDTO> Insert([FromBody] MerchantDTO dto)
    //{
    //    var result =  _merchantService.Insert(dto);
    //    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    //}

    //[HttpPut("{id}")]
    //public  ActionResult<MerchantDTO> Update(int id, [FromBody] MerchantDTO dto)
    //{
    //    var result =  _merchantService.Update(id, dto);
    //    if (result == null) return NotFound();
    //    return Ok(result);
    //}

    //[HttpDelete("{id}")]
    //public  ActionResult Delete(int id)
    //{
    //    var success =  _merchantService.Delete(id);
    //    if (!success) return NotFound();
    //    return NoContent();
    //}

    //[HttpGet("{id}")]
    //public  ActionResult<MerchantDTO> GetById(int id)
    //{
    //    var result =  _merchantService.GetById(id);
    //    if (result == null) return NotFound();
    //    return Ok(result);
    //}
}
