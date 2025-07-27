using AutoMapper;
using Bussiness.Helpers;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;

public class CategoryService : _BusinessService<Category, CategoryDTO>, ICategoryService
{
    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
        
    }

    public override DataSourceResult<CategoryDTO> GetAll(int pageSize, int page, string? searchTerm = null)
    {
        var allCategories = _UnitOfWork.Repository<Category>()
            .GetAll()
            .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
            .ToList();

        List<CategoryDTO> result = _Mapper.Map<List<CategoryDTO>>(allCategories.Take(((page - 1) * pageSize)..(page * pageSize)));

        return new DataSourceResult<CategoryDTO>
        {
            Data = result,
            Count = allCategories.Count
        };
    }
}
