using AutoMapper;
using Bussiness.IService;
using Data;
using Data.DTOs;
using Data.Models;

namespace Bussiness.Services
{
    public class CountryOfManufactureService : _BusinessService<CountryOfManufacture, CountryOfManufactureDTO>, ICountryOfManufactureService
    {
        public CountryOfManufactureService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
             
        }
    }
}
