using Bussiness.Helpers;
using Bussiness.Interfaces;
using Data.DTOs;

public interface IPartService : _IBusinessService<Part, PartDTO>
{
   DataSourceResult<PartDTO> AdvancedSearch(PartFilterViewModel part, int page, int pageSize);
}
