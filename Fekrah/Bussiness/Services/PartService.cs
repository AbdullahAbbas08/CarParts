using AutoMapper;
using Azure;
using Bussiness.Helpers;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Enums;
using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

public class PartService : _BusinessService<Part, PartDTO>, IPartService
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ISessionService _sessionService;

    public PartService(IUnitOfWork unitOfWork, IMapper mapper, ISessionService sessionService) : base(unitOfWork, mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        _sessionService = sessionService;
    }

    public override DataSourceResult<PartDTO> GetAll(int pageSize, int page, string? searchTerm = null)
    {
        var allParts = _UnitOfWork.Repository<Part>()
            .GetAll()
            .Include(p => p.Merchant)
            .Include(p => p.Category)
            .Include(p => p.CarModelType)
            .ThenInclude(p => p.Brand)
            .Include(p => p.CountryOfManufacture)
            .AsSplitQuery()
            .Where(p => string.IsNullOrEmpty(searchTerm) || p.Name.Contains(searchTerm))
            .ToList();

        List<PartDTO> result = allParts
            .Take(((page - 1) * pageSize)..(page * pageSize))
            .Select(p => new PartDTO
            {
                Id  = p.Id,
                Condition = p.Condition,
                ConditionName = Enum.GetName(p.Condition),
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name,
                ImageUrl = p.ImageUrls?.Select(i => i.ImagePath).ToList(),
                Description = p.Description,
                Name = p.Name,
                Price = p.Price,
                FinalPrice = p.FinalPrice,
                Quality = p.Quality,
                QualityName = Enum.GetName(p.Quality),
                PartType = p.PartType,
                PartTypeName = Enum.GetName(p.PartType),
                IsSold = p.IsSold,
                YearOfManufacture = p.YearOfManufacture,
                MerchantId = p.MerchantId,
                MerchantName = p.Merchant?.ShopName,
                CarModelTypeId = p.CarModelTypeId,
                CarModelTypeName = p.CarModelType?.Name,
                CarModelId = p.CarModelType.BrandId,
                CarModelName = p.CarModelType.Brand?.Name,
                CountryOfManufactureId = p.CountryOfManufactureId,
                CountryOfManufactureName = p.CountryOfManufacture.Name,
                Count = p.Count
            })
            .ToList();

        return new DataSourceResult<PartDTO>
        {
            Data = result,
            Count = allParts.Count
        };
    }

    public override PartDTO GetById(object id)
    {
        var part = _UnitOfWork.Repository<Part>()
            .GetAll()
            .Include(p => p.Merchant)
            .Include(p => p.Category)
            .Include(p => p.CarModelType)
            .ThenInclude(p => p.Brand)
            .Include(p => p.CountryOfManufacture)
            .AsSplitQuery()
            .FirstOrDefault(p => p.Id == (int)id);

        if (part is null) return null;

        var RES = new PartDTO
        {
            Id = part.Id,
            Condition = part.Condition,
            ConditionName = Enum.GetName(part.Condition),
            CategoryId = part.CategoryId,
            CategoryName = part.Category?.Name,
            ImageUrl = part.ImageUrls?.Select(i => i.ImagePath).ToList(),
            Description = part.Description,
            Name = part.Name,
            Price = part.Price,
            FinalPrice = part.FinalPrice,
            Quality = part.Quality,
            QualityName = Enum.GetName(part.Quality),
            PartType = part.PartType,
            PartTypeName = Enum.GetName(part.PartType),
            IsSold = part.IsSold,
            YearOfManufacture = part.YearOfManufacture, 
            MerchantId = part.MerchantId,
            MerchantName = part.Merchant?.ShopName,
            CarModelTypeId = part.CarModelTypeId,
            CarModelTypeName = part.CarModelType?.Name,
            CarModelId = part.CarModelType.BrandId,
            CarModelName = part.CarModelType.Brand?.Name,
            CountryOfManufactureId = part.CountryOfManufactureId,
            CountryOfManufactureName = part.CountryOfManufacture.Name,
            Count = part.Count
        };
        return RES;
    }



    public override PartDTO Insert(PartDTO part)
    {
        if (_sessionService.UserType.HasValue && _sessionService.UserType != (int)UserTypeEnum.Merchant)
            return null;

        Part _addNewPart = mapper.Map<Part>(part);
        _addNewPart.MerchantId = part.MerchantId.HasValue ? (int)part.MerchantId : _sessionService.MerchantId.Value;
        _addNewPart.CarModelType = null;
        //_addNewPart.
        var addNewPart = mapper.Map<PartDTO>(_addNewPart);

        var result = base.Insert(addNewPart);

        return GetById(result.Id);
    }

    public override PartDTO Update(PartDTO entity)
    {
        if (_sessionService.UserType.HasValue && _sessionService.UserType != (int)UserTypeEnum.Merchant)
            return null;

        var currentPart = _UnitOfWork.Repository<Part>()
            .GetAll()
            .Include(p => p.ImageUrls)
            .FirstOrDefault(p => p.Id == entity.Id);

        if(currentPart is not null)
        {
            foreach (var img in currentPart.ImageUrls)
            {
                _UnitOfWork.Repository<Image>().Delete(img);
            }
        }

        return base.Update(entity);
    }

    public DataSourceResult<PartDTO> AdvancedSearch(PartFilterViewModel part, int page, int pageSize)
    {
        var allFilteredParts = _UnitOfWork.Repository<Part>()
            .GetAll()
            .Include(p => p.CarModelType)
            .ThenInclude(c => c.Brand)
            .Include(c => c.CountryOfManufacture)
            .Where(p => (part.CarModel == 0 || p.CarModelType.BrandId == part.CarModel) &&
                        (part.CarModelType == 0 || p.CarModelTypeId == part.CarModelType) &&
                        (part.YearOfManufactureFrom == 0 || p.YearOfManufacture >= part.YearOfManufactureFrom) &&
                        (part.YearOfManufactureTo == 0 || p.YearOfManufacture <= part.YearOfManufactureTo) &&
                        (part.PartCondition == 0 || (int)p.Condition == part.PartCondition) &&
                        (part.PartQuality == 0 || (int)p.Quality == part.PartQuality) &&
                        (part.PartType == 0 || (int)p.PartType == part.PartType) &&
                        (part.PriceFrom == 0 || p.Price >= part.PriceFrom) &&
                        (part.PriceTo == 0 || p.Price <= part.PriceTo) &&
                        (part.CountryOfManufacture == 0 || p.CountryOfManufactureId == part.CountryOfManufacture) &&
                        (part.PartCount == 0 || p.Count >= part.PartCount) &&
                        (!part.CreatedOn.HasValue || p.CreatedOn.Equals(part.CreatedOn)) &&
                        (!(part.IsSold || (part.IsSold && p.IsSold))
                        ))
            .ToList();

        List<PartDTO> result = allFilteredParts
        .Take(((page - 1) * pageSize)..(page * pageSize))
        .Select(p => new PartDTO
            {
                Id = p.Id,
                Condition = p.Condition,
                ConditionName = Enum.GetName(p.Condition),
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name,
                ImageUrl = p.ImageUrls.Select(i => i.ImagePath).ToList(),
                Description = p.Description,
                Name = p.Name,
                Price = p.Price,
                FinalPrice = p.FinalPrice,
                Quality = p.Quality,
                QualityName = Enum.GetName(p.Quality),
                PartType = p.PartType,
                PartTypeName = Enum.GetName(p.PartType),
                IsSold = p.IsSold,
                YearOfManufacture = p.YearOfManufacture,
                MerchantId = p.MerchantId,
                MerchantName = p.Merchant?.ShopName,
                CarModelTypeId = p.CarModelTypeId,
                CarModelTypeName = p.CarModelType?.Name,
                CarModelId = p.CarModelType.BrandId,
                CarModelName = p.CarModelType.Brand?.Name,
                CountryOfManufactureId = p.CountryOfManufactureId,
                CountryOfManufactureName = p.CountryOfManufacture.Name,
                Count = p.Count
            })
            .ToList();

        return new DataSourceResult<PartDTO>
        {
            Data = result,
            Count = allFilteredParts.Count
        };
    }
}
