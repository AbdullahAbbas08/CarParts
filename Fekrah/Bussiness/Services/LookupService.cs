using Bussiness.Interfaces;
using Data;
using Data.DTOs;
using Data.Enums;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Services
{
    public class LookupService : ILookupService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LookupService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<LookupDTO> GetLookUpDetails(string lookupName, string? searchTerm = null)
        {
            List<LookupDTO> result = new();

            switch (lookupName.ToLower())
            {
                case "categories":
                    result = _unitOfWork.Repository<Category>()
                        .GetAll()
                        .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,  
                            Text = c.Name,
                        }).ToList();
                    break;

                case "parts":
                    result = _unitOfWork.Repository<Part>()
                        .GetAll()
                        .Where (p => string.IsNullOrEmpty(searchTerm) || p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.Name,
                        }).ToList();
                    break;

                case "sellers":
                    result = _unitOfWork.Repository<Merchant>()
                        .GetAll()
                        .Where(s => string.IsNullOrEmpty(searchTerm) || s.ShopName.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.ShopName,
                        }).ToList();
                    break;
                case "cities":
                    result = _unitOfWork.Repository<City>()
                        .GetAll()
                        .Where(s => string.IsNullOrEmpty(searchTerm) || s.NameAr.Contains(searchTerm) )
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.NameAr,
                        }).ToList();
                    break;
                case "countryofmanufacture":
                    result = _unitOfWork.Repository<CountryOfManufacture>()
                        .GetAll()
                        .Where(s => string.IsNullOrEmpty(searchTerm) || s.Name.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.Name,
                        }).ToList();
                    break;
                case "carsmodel":
                    result = _unitOfWork.Repository<CarsModel>()
                        .GetAll()
                        .Where(s => string.IsNullOrEmpty(searchTerm) || s.Name.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.Name,
                        }).ToList();
                    break;
                case "modeltype":
                    result = _unitOfWork.Repository<ModelType>()
                        .GetAll()
                        .Where(s => string.IsNullOrEmpty(searchTerm) || s.Name.Contains(searchTerm))
                        .Select(c => new LookupDTO
                        {
                            Id = c.Id,
                            Text = c.Name,
                        }).ToList();
                    break;
                case "parttype":
                    foreach (PartTypeEnum partType in Enum.GetValues(typeof(PartTypeEnum)))
                    {
                        var newlookUp = new LookupDTO()
                        {
                            Id = (int)partType,
                            Text = partType.ToString()
                        };

                        result.Add(newlookUp);
                    }
                    break;
                case "partcondition":
                    foreach (PartConditionEnum partCondition in Enum.GetValues(typeof(PartConditionEnum)))
                    {
                        var newlookUp = new LookupDTO()
                        {
                            Id = (int)partCondition,
                            Text = partCondition.ToString()
                        };

                        result.Add(newlookUp);
                    }
                    break;
                case "partquality":
                    foreach (PartQualityEnum partQualityEnum in Enum.GetValues(typeof(PartQualityEnum)))
                    {
                        var newlookUp = new LookupDTO()
                        {
                            Id = (int)partQualityEnum,
                            Text = partQualityEnum.ToString()
                        };

                        result.Add(newlookUp);
                    }
                    break;
                default:
                    break;
            }


            return result;
        }

        public List<GovernorateLookupDto> GetGovernorates()
        {
            return _unitOfWork.Repository<Governorate>()
                .GetAll()
                .Select(g => new GovernorateLookupDto
                {
                    Id = g.Id,
                    Name = g.Name
                }).ToList();
        }

        public List<CityLookupDto> GetCities(int? governorateId = null)
        {
            var query = _unitOfWork.Repository<City>().GetAll().AsQueryable();
            if (governorateId.HasValue)
                query = query.Where(c => c.GovernorateId == governorateId.Value);
            return query.Select(c => new CityLookupDto
            {
                Id = c.Id,
                NameAr = c.NameAr,
                GovernorateId = c.GovernorateId
            }).ToList();
        }
    }
}
