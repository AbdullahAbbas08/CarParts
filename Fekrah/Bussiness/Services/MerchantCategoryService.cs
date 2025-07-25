﻿using AutoMapper;
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
    public class MerchantCategoryService : _BusinessService<SellerCategory, SellerCategoryDTO>, IMerchantCategoryService
    {
        public MerchantCategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            
        }

        public override DataSourceResult<SellerCategoryDTO> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            var allSellerCategories = _UnitOfWork.Repository<SellerCategory>()
                .GetAll()
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
                .ToList();

            List<SellerCategoryDTO> result = _Mapper.Map<List<SellerCategoryDTO>>(allSellerCategories.Take(((page - 1) * pageSize)..(page * pageSize)));

            return new DataSourceResult<SellerCategoryDTO>
            {
                Data = result,
                Count = allSellerCategories.Count
            };
        }
    }
}
