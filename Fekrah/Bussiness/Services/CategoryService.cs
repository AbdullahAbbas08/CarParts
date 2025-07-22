using AutoMapper;
using Bussiness.Helpers;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;

public class CategoryService : _BusinessService<Category, CategoryDto>, ICategoryService
{
    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
        
    }

    public override DataSourceResult<CategoryDto> GetAll(int pageSize, int page, string? searchTerm = null)
    {
        var allCategories = _UnitOfWork.Repository<Category>()
            .GetAll()
            .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
            .ToList();

        List<CategoryDto> result = _Mapper.Map<List<CategoryDto>>(allCategories.Take(((page - 1) * pageSize)..(page * pageSize)));

        return new DataSourceResult<CategoryDto>
        {
            Data = result,
            Count = allCategories.Count
        };
    }
}
