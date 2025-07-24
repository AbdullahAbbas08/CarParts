using AutoMapper;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;

public class MerchantService : _BusinessService<Merchant, MerchantDTO>, IMerchantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MerchantService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public MerchantDTO Insert(MerchantDTO dto)
    {
        if (dto.CommercialRegistrationImageForm != null)
        {
            using (var ms = new MemoryStream())
            {
                dto.CommercialRegistrationImageForm.CopyTo(ms);
                dto.CommercialRegistrationImage = Convert.ToBase64String(ms.ToArray());
            }
        }

        var entity = _mapper.Map<Merchant>(dto);
        _unitOfWork.Repository<Merchant>().Insert(entity);
        _unitOfWork.SaveChanges();
        return _mapper.Map<MerchantDTO>(entity);
    }

    public MerchantDTO Update(int id, MerchantDTO dto)
    {
        var repo = _unitOfWork.Repository<Merchant>();
        var entity = repo.GetById(id);
        if (entity == null) return null;

        if (dto.CommercialRegistrationImageForm != null)
        {
            using (var ms = new MemoryStream())
            {
                dto.CommercialRegistrationImageForm.CopyTo(ms);
                dto.CommercialRegistrationImage = Convert.ToBase64String(ms.ToArray());
            }
        }

        _mapper.Map(dto, entity);
        repo.Update(entity);
        _unitOfWork.SaveChanges();
        return _mapper.Map<MerchantDTO>(entity);
    }


    public bool Delete(int id)
    {
        var repo = _unitOfWork.Repository<Merchant>();
        var entity =  repo.GetById(id);
        if (entity == null) return false;
        repo.Delete(entity);
         _unitOfWork.SaveChanges();
        return true;
    }

    public  MerchantDTO GetById(int id)
    {
        var entity =  _unitOfWork.Repository<Merchant>().GetById(id);
        return entity == null ? null : _mapper.Map<MerchantDTO>(entity);
    }
}
