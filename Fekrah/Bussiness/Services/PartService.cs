using AutoMapper;
using Bussiness.Helpers;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Microsoft.EntityFrameworkCore;

public class PartService : _BusinessService<Part, PartDTO>, IPartService
{
    public PartService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {

    }

    public override DataSourceResult<PartDTO> GetAll(int pageSize, int page, string? searchTerm = null)
    {
        var allParts = _UnitOfWork.Repository<Part>()
            .GetAll()
            .Where(p => string.IsNullOrEmpty(searchTerm) || p.Name.Contains(searchTerm))
            .ToList();

        List<PartDTO> result = allParts
            .Take(((page - 1) * pageSize)..(page * pageSize))
            .Select(p => new PartDTO
            {
                Id  = p.Id,
                Condition = p.Condition,
                ConditionName = Enum.GetName(p.Condition),
                CategoryId = p.CategoryId,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                Name = p.Name,
                Price = p.Price,
                //CarModelId = p.CarsModelId,
                //CarModelName = p.CarsModel?.Name
            })
            .ToList();

        return new DataSourceResult<PartDTO>
        {
            Data = result,
            Count = allParts.Count
        };
    }
}
