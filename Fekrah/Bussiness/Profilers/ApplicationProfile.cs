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
            CreateMap<Category, CategoryDTO>().ReverseMap();
            CreateMap<Merchant, MerchantDTO>()
                .ForMember(dest => dest.CategoriesDTO, opt => opt.MapFrom(src => src.Categories))
                .ReverseMap()
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.CategoriesDTO));
            CreateMap<Part, PartDTO>().ReverseMap();
            CreateMap<CarsModel, CarsModelDto>().ReverseMap();
            CreateMap<City, CityDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<Governorate, GovernorateDTO>().ReverseMap();
            CreateMap<Member, MemberDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
        }
    }
}
