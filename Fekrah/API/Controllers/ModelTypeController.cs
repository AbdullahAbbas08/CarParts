using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModelTypeController : _BaseController<ModelType, ModelTypeDTO>
    {
        public ModelTypeController(IModelTypeService carsModelService) : base(carsModelService)
        {
            
        }
    }
}
