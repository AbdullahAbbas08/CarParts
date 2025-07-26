using AutoMapper;
using Data.DTOs;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Profilers
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<Merchant, MerchantDTO>().ReverseMap();
            CreateMap<Part, PartDTO>().ReverseMap();
            CreateMap<SellerCategory, SellerCategoryDTO>().ReverseMap();
            CreateMap<CarsModel, CarsModelDto>().ReverseMap();
            CreateMap<City, CityDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<Governorate, GovernorateDTO>().ReverseMap();
        }
    }
}
