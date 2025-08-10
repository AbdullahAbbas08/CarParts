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
    public class BrandService : _BusinessService<Brand, BrandDTO>, IBrandService
    {
        public BrandService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            
        }

        public override DataSourceResult<BrandDTO> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            
            var allCarsModel = _UnitOfWork.Repository<Brand>()
                .GetAll()
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
                .OrderByDescending(c => c.Id)
                .ToList();

            List<BrandDTO> result = _Mapper.Map<List<BrandDTO>>(allCarsModel.Take(((page - 1) * pageSize)..(page * pageSize)));

            return new DataSourceResult<BrandDTO>
            {
                Data = result,
                Count = allCarsModel.Count
            };
        }

        public override BrandDTO Insert(BrandDTO entity)
        {
            var checKBrandCodeExist = _UnitOfWork.Repository<Brand>()
                .GetAll()
                .FirstOrDefault(b => b.Code.Equals(entity.Code));

            if (checKBrandCodeExist is not null)
                return null;

            return base.Insert(entity);
        }
    }
}
