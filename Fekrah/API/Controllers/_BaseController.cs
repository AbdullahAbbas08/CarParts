using Bussiness.Helpers;
using Bussiness.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class _BaseController<TDbEntity, TDetailsDTO> : ControllerBase where TDbEntity : class
    {
        private readonly _IBusinessService<TDbEntity, TDetailsDTO> _IBusinessServices;

        public _BaseController(_IBusinessService<TDbEntity, TDetailsDTO> IBusinessServices)
        {
            _IBusinessServices = IBusinessServices;
        }

        [HttpGet, Route("GetAll")]
        public DataSourceResult<TDetailsDTO> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            return _IBusinessServices.GetAll(pageSize, page, searchTerm);
        }

        [HttpGet, Route("GetDetails")]
        public virtual TDetailsDTO GetDetails(int id)
        {
            return _IBusinessServices.GetById(id);
        }

        [HttpPost, Route("Insert")]
        public TDetailsDTO Insert([FromBody] TDetailsDTO entity)
        {
            return _IBusinessServices.Insert(entity);
        }

        [HttpPost, Route("Update")]
        public TDetailsDTO Update([FromBody] TDetailsDTO entity)
        {
            return _IBusinessServices.Update(entity);
        }

        [HttpPost, Route("Delete")]
        public TDetailsDTO Delete(int Id)
        {
            return _IBusinessServices.Delete(Id);
        }
    }
}
