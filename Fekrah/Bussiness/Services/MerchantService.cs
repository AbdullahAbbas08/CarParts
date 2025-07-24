using AutoMapper;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;

public class MerchantService : _BusinessService<Merchant, MerchantDTO>, ISellerService
{
    public MerchantService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
    }

    public override MerchantDTO Insert(MerchantDTO entity)
    {
        return base.Insert(entity);
    }

    public override MerchantDTO Update(MerchantDTO entity)
    {
        return base.Update(entity);
    }

    public override MerchantDTO Delete(object id)
    {
        return base.Delete(id);
    }

    public override MerchantDTO GetById(object id)
    {
        var merchant = _UnitOfWork.Repository<Merchant>()
            .GetAll()
            .Include(m => m.City)
            .Include(m => m.Parts)
            .Include(m => m.SellerCategories)
            .FirstOrDefault(m => m.Id == (int)id);

        if (merchant == null)
            return null;

        return _Mapper.Map<MerchantDTO>(merchant);
    }
}
