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
    public class CarsModelService : _BusinessService<Brand, BrandDTO>, ICarsModelService
    {
        public CarsModelService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            
        }

        public override DataSourceResult<BrandDTO> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            var allCarsModel = _UnitOfWork.Repository<Brand>()
                .GetAll()
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
                .ToList();

            List<BrandDTO> result = _Mapper.Map<List<BrandDTO>>(allCarsModel.Take(((page - 1) * pageSize)..(page * pageSize)));

            return new DataSourceResult<BrandDTO>
            {
                Data = result,
                Count = allCarsModel.Count
            };
        }
    }
}
