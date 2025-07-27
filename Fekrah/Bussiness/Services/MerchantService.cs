using AutoMapper;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
        try
        {
            if (dto.CommercialRegistrationImageForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.CommercialRegistrationImageForm.CopyTo(ms);
                    dto.CommercialRegistrationImage = ms.ToArray();
                }
            }
            if (dto.NationalIdImageForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.NationalIdImageForm.CopyTo(ms);
                    dto.NationalIdImage = ms.ToArray();
                }
            }
            if (dto.LogoForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.LogoForm.CopyTo(ms);
                    dto.Logo = ms.ToArray();
                }
            }

            var newMembers = JsonSerializer.Deserialize<List<UserDTO>>(dto.MembersJson) ?? new List<UserDTO>();
            var newCategories = !string.IsNullOrEmpty(dto.CategoriesJson) ? JsonSerializer.Deserialize<List<CategoryDTO>>(dto.CategoriesJson) : dto.CategoriesDTO;
           
            var existingUsers = _unitOfWork.Repository<User>().GetAll().ToList();
            var filteredMembers = newMembers.Where(u =>
                !existingUsers.Any(e =>
                    (!string.IsNullOrEmpty(u.UserName) && e.UserName == u.UserName)
                    || (!string.IsNullOrEmpty(u.Email) && e.Email == u.Email)
                    || (!string.IsNullOrEmpty(u.NationalId) && e.NationalId == u.NationalId)
                    || (!string.IsNullOrEmpty(u.PhoneNumber) && e.PhoneNumber == u.PhoneNumber)
                )
            ).ToList();
            dto.Members = filteredMembers.Select(x=> new MemberDTO
            {
                UserDTO = x
            }).ToList();
            var entity = _mapper.Map<Merchant>(dto);

            // ربط التصنيفات المختارة مع إضافة الجديد
            if (newCategories != null && newCategories.Any())
            {
                var categoriesToAdd = new List<Category>();
                foreach (var catDto in newCategories)
                {
                    if (catDto.Id == 0)
                    {
                        var newCat = new Category { Name = catDto.Name };
                        _unitOfWork.Repository<Category>().Insert(newCat);
                        _unitOfWork.SaveChanges();
                        categoriesToAdd.Add(newCat);
                    }
                    else
                    {
                        var existingCat = _unitOfWork.Repository<Category>().GetAll().FirstOrDefault(c => c.Id == catDto.Id);
                        if (existingCat != null)
                            categoriesToAdd.Add(existingCat);
                    }
                }
                entity.Categories = categoriesToAdd;
            }

            _unitOfWork.Repository<Merchant>().Insert(entity);
            _unitOfWork.SaveChanges();
            return _mapper.Map<MerchantDTO>(entity);
        }
        catch (Exception ex)
        {
            // يمكن تسجيل الخطأ هنا
            return null;
        }
    }

    public MerchantDTO Update(int id, MerchantDTO dto)
    {
        try
        {
            var repo = _unitOfWork.Repository<Merchant>();
            var entity = repo.GetById(id);
            if (entity == null) return null;

            // تحديث الصور فقط إذا تم رفع ملفات جديدة
            if (dto.CommercialRegistrationImageForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.CommercialRegistrationImageForm.CopyTo(ms);
                    entity.CommercialRegistrationImage = ms.ToArray();
                }
            }
            if (dto.NationalIdImageForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.NationalIdImageForm.CopyTo(ms);
                    entity.NationalIdImage = ms.ToArray();
                }
            }
            if (dto.LogoForm != null)
            {
                using (var ms = new MemoryStream())
                {
                    dto.LogoForm.CopyTo(ms);
                    entity.Logo = ms.ToArray();
                }
            }

            // تحديث بيانات الأعضاء مع منع التكرار في الداتا بيز
            if (!string.IsNullOrEmpty(dto.MembersJson))
            {
                var newMembers = JsonSerializer.Deserialize<List<UserDTO>>(dto.MembersJson) ?? new List<UserDTO>();
                var existingUsers = _unitOfWork.Repository<User>().GetAll().ToList();
                var filteredMembers = newMembers.Where(u =>
                    !existingUsers.Any(e =>
                        (!string.IsNullOrEmpty(u.UserName) && e.UserName == u.UserName)
                        || (!string.IsNullOrEmpty(u.Email) && e.Email == u.Email)
                        || (!string.IsNullOrEmpty(u.NationalId) && e.NationalId == u.NationalId)
                        || (!string.IsNullOrEmpty(u.PhoneNumber) && e.PhoneNumber == u.PhoneNumber)
                    )
                ).ToList();
                dto.Members = filteredMembers.Select(x => new MemberDTO
                {
                    UserDTO = x
                }).ToList();
            }

            // تحديث التصنيفات مع إضافة الجديد
            var newCategories = !string.IsNullOrEmpty(dto.CategoriesJson) ? JsonSerializer.Deserialize<List<CategoryDTO>>(dto.CategoriesJson) : dto.CategoriesDTO;
            if (newCategories != null)
            {
                var categoriesToAdd = new List<Category>();
                foreach (var catDto in newCategories)
                {
                    if (catDto.Id == 0)
                    {
                        var newCat = new Category { Name = catDto.Name };
                        _unitOfWork.Repository<Category>().Insert(newCat);
                        _unitOfWork.SaveChanges();
                        categoriesToAdd.Add(newCat);
                    }
                    else
                    {
                        var existingCat = _unitOfWork.Repository<Category>().GetAll().FirstOrDefault(c => c.Id == catDto.Id);
                        if (existingCat != null)
                            categoriesToAdd.Add(existingCat);
                    }
                }
                entity.Categories = categoriesToAdd;
            }

            // تحديث باقي بيانات التاجر
            _mapper.Map(dto, entity);
            repo.Update(entity);
            _unitOfWork.SaveChanges();
            return _mapper.Map<MerchantDTO>(entity);
        }
        catch (Exception ex)
        {
            // يمكن تسجيل الخطأ هنا
            return null;
        }
    }


    public bool Delete(int id)
    {
        try
        {
            var repo = _unitOfWork.Repository<Merchant>();
            var entity = repo.GetById(id);
            if (entity == null) return false;
            repo.Delete(entity);
            _unitOfWork.SaveChanges();
            return true;
        }
        catch (Exception ex)
        {
            // يمكن تسجيل الخطأ هنا
            return false;
        }
    }

    public MerchantDTO GetById(int id)
    {
        try
        {
            var entity = _unitOfWork.Repository<Merchant>().GetAll()
                .Include(m => m.Members)
                .Include(x => x.City)
                .Include(x => x.Governorate)
                .Include(x => x.Categories)
                .FirstOrDefault(m => m.Id == id);
            return entity == null ? null : _mapper.Map<MerchantDTO>(entity);
        }
        catch (Exception ex)
        {
            // يمكن تسجيل الخطأ هنا
            return null;
        }
    }
}
