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
            CreateMap<Part, PartDTO>()
                  .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                  .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                  .ReverseMap()
                  .ForMember(dest => dest.Category, opt => opt.Ignore())
                  .ForMember(dest => dest.CountryOfManufacture, opt => opt.Ignore())
                  .ForMember(dest => dest.CarModelType, opt => opt.Ignore());
            CreateMap<Brand, BrandDTO>().ReverseMap();
            CreateMap<City, CityDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<Governorate, GovernorateDTO>().ReverseMap();
            CreateMap<Member, MemberDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
            CreateMap<ModelType, ModelTypeDTO>().ReverseMap();
            // Offer mapping
            CreateMap<Offer, OfferDTO>().ReverseMap();
            CreateMap<Image, ImageDTO>().ReverseMap();

        }
    }
}
