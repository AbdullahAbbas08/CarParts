using AutoMapper;
using Bussiness.Helpers;
using Bussiness.Interfaces;
using Data;
using Data.DTOs;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Services
{
    public class SellerCategoryService : _BusinessService<SellerCategory, SellerCategoryDto>, ISellerCategoryService
    {
        public SellerCategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            
        }

        public override DataSourceResult<SellerCategoryDto> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            var allSellerCategories = _UnitOfWork.Repository<SellerCategory>()
                .GetAll()
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
                .ToList();

            List<SellerCategoryDto> result = _Mapper.Map<List<SellerCategoryDto>>(allSellerCategories.Take(((page - 1) * pageSize)..(page * pageSize)));

            return new DataSourceResult<SellerCategoryDto>
            {
                Data = result,
                Count = allSellerCategories.Count
            };
        }
    }
}
