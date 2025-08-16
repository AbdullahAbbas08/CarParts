using Bussiness.IService;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfferController : _BaseController<Offer, OfferDTO>
    {
        public OfferController(IOfferService offerService) : base(offerService)
        {
        }
    }
}
