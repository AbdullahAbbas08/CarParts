using AutoMapper;
using Bussiness.Helpers;
using Bussiness.Services;
using Data;
using Data.Enums;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Data.ViewModels;
using Azure;

public class MerchantService : _BusinessService<Merchant, MerchantDTO>, ISellerService
{
    public MerchantService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
        
    }

  
}

