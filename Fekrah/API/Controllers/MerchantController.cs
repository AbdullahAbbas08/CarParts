using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class MerchantController : _BaseController<Merchant, MerchantDTO>
{
    private readonly IMerchantService _merchantService;

    public MerchantController(IMerchantService merchantService) : base(merchantService)
    {
        _merchantService = merchantService;
    }

    [HttpGet("GetDataById/{id}")]
    public ActionResult<MerchantDTO> GetDataById(int id)
    {
        var result = _merchantService.GetById(id);
        if (result == null) return NoContent();
        return Ok(result);
    }

    [HttpPost("InsertMerchant")]
    public ActionResult<MerchantDTO> InsertMerchant([FromForm] MerchantDTO dto)
    {
        var result = _merchantService.Insert(dto);
        return result;
    }

    [HttpPost("UpdateMerchant/{id}")]
    public async Task<ActionResult<MerchantDTO>> Update(int id, [FromForm] MerchantDTO dto)
    {
        var result = await _merchantService.Update(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("Activate/{id}")]
    public ActionResult<MerchantDTO> ActivateMerchant(int id)
    {
        var result = _merchantService.ActivateMerchant(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("Deactivate/{id}")]
    public ActionResult<MerchantDTO> DeactivateMerchant(int id)
    {
        var result = _merchantService.DeactivateMerchant(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("Close/{id}")]
    public ActionResult<MerchantDTO> CloseMerchant(int id)
    {
        var result = _merchantService.CloseMerchant(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    //[HttpDelete("{id}")]
    //public  ActionResult Delete(int id)
    //{
    //    var success =  _merchantService.Delete(id);
    //    if (!success) return NotFound();
    //    return NoContent(); 
    //}


}
