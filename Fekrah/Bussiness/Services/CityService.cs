using AutoMapper;
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
    public class CityService : _BusinessService<City, CityDto>, ICityService
    {
        public CityService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            
        }
    }
}
