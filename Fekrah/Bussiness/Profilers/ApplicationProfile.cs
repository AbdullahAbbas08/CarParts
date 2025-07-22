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
            CreateMap<Seller, SellerDto>().ReverseMap();
            CreateMap<Part, PartDto>().ReverseMap();
            CreateMap<SellerCategory, SellerCategoryDto>().ReverseMap();
            CreateMap<CarsModel, CarsModelDto>().ReverseMap();
            CreateMap<City, CityDto>().ReverseMap();
        }
    }
}
