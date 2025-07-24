using Bussiness.Helpers;

namespace Bussiness.Interfaces
{
    public interface _IBusinessService
    {
    }

    public interface _IBusinessService<TDbEntity, TDetailsDTO> where TDbEntity : class
    {
        DataSourceResult<TDetailsDTO> GetAll(int pageSize, int page, string? searchTerm = null);
        TDetailsDTO GetById(object id);
        TDetailsDTO Insert(TDetailsDTO entity);
        TDetailsDTO Update(TDetailsDTO entity);
        TDetailsDTO Delete(object id);
    }
}
