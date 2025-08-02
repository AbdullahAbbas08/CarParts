using AutoMapper;
using Bussiness.Services;
using Data;
using Data.DTOs;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Data.ViewModels;
using Bussiness.Interfaces;

public class MerchantService : _BusinessService<Merchant, MerchantDTO>, IMerchantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly string _mainImagePath;
    private readonly string _backupImagePath;
    private readonly string _webRootPath;
    private readonly IAccountService _accountService;

    public MerchantService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration,
        IHostingEnvironment webHostEnvironment, IAccountService accountService) : base(unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _mainImagePath = configuration["MerchantImagePaths:Main"];
        _backupImagePath = configuration["MerchantImagePaths:Backup"];
        _webRootPath = webHostEnvironment.ContentRootPath;
        _accountService = accountService;
    }

    private string SaveImageToPaths(IFormFile file)
    {
        if (file == null) return null;
        var fileExt = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        // Save under wwwroot/Main and wwwroot/Backup
        var mainPath = Path.Combine(_webRootPath, _mainImagePath, fileName);
        var backupPath = Path.Combine(_webRootPath, _backupImagePath, fileName);

        var mainDir = Path.GetDirectoryName(mainPath);
        var backupDir = Path.GetDirectoryName(backupPath);

        if (!Directory.Exists(mainDir))
            Directory.CreateDirectory(mainDir);
        if (!Directory.Exists(backupDir))
            Directory.CreateDirectory(backupDir);

        using (var stream = new FileStream(mainPath, FileMode.Create))
        {
            file.CopyTo(stream);
        }
        using (var stream = new FileStream(backupPath, FileMode.Create))
        {
            file.CopyTo(stream);
        }
        // Return relative path (e.g. MerchantData/filename.jpg)
        return  fileName.Replace("\\", "/");
    }

    public MerchantDTO Insert(MerchantDTO dto)
    {
        try
        {
            var MerchantCount = _unitOfWork.Repository<Merchant>().GetAll().Count();
            if (MerchantCount == 0) MerchantCount = 1;
            dto.Code = DateTime.Now.Year.ToString().Substring(2, 2) +
                       DateTime.Now.Month.ToString("00") +
                       (MerchantCount+1).ToString("000000");

            // Save images and set file names
            if (dto.CommercialRegistrationImageForm != null)
            {
                dto.CommercialRegistrationImage = null;
                var fileName = SaveImageToPaths(dto.CommercialRegistrationImageForm);
                dto.CommercialRegistrationImage = fileName;
            }
            if (dto.NationalIdImageForm != null)
            {
                dto.NationalIdImage = null;
                var fileName = SaveImageToPaths(dto.NationalIdImageForm);
                dto.NationalIdImage = fileName;
            }
            if (dto.LogoForm != null)
            {
                dto.Logo = null;
                var fileName = SaveImageToPaths(dto.LogoForm);
                dto.Logo = fileName;
            }

            var newMembers = JsonSerializer.Deserialize<List<RegisterViewModel>>(dto.MembersJson) ?? new List<RegisterViewModel>();
            var newCategories = !string.IsNullOrEmpty(dto.CategoriesJson) ? JsonSerializer.Deserialize<List<CategoryDTO>>(dto.CategoriesJson) : dto.CategoriesDTO;

            var existingUsers = _unitOfWork.Repository<User>().GetAll().ToList();
            var filteredMembers = newMembers.Where(u =>
                !existingUsers.Any(e =>
                    (!string.IsNullOrEmpty(u.UserName) && e.UserName == u.UserName)
                    || (!string.IsNullOrEmpty(u.Email) && e.Email == u.Email)
                    || (!string.IsNullOrEmpty(u.PhoneNumber) && e.PhoneNumber == u.PhoneNumber)
                )
            ).ToList();

            List<AuthDto> NewUsers = new List<AuthDto>();
            foreach (var item in filteredMembers)
            {
                //var _user = _mapper.Map<User>(item);
                //NewUsers.Add(_user);
                //_unitOfWork.Repository<User>().Insert(_user);

                var _user = _accountService.RegisterNewUser(item);
                NewUsers.Add(_user.Result);
            }

            dto.Members = NewUsers.Select(x => new MemberDTO
            {
                UserId = x.UserId
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
                var fileName = SaveImageToPaths(dto.CommercialRegistrationImageForm);
                entity.CommercialRegistrationImage = fileName;
            }
            if (dto.NationalIdImageForm != null)
            {
                var fileName = SaveImageToPaths(dto.NationalIdImageForm);
                entity.NationalIdImage = fileName;
            }
            if (dto.LogoForm != null)
            {
                var fileName = SaveImageToPaths(dto.LogoForm);
                entity.Logo = fileName;
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
            var ttt = entity == null ? null : _mapper.Map<MerchantDTO>(entity);
            return ttt;
        }
        catch (Exception ex)
        {
            // يمكن تسجيل الخطأ هنا
            return null;
        }
    }

    public MerchantDTO ActivateMerchant(int id)
    {
        var repo = _unitOfWork.Repository<Merchant>();
        var entity = repo.GetById(id);
        if (entity == null) return null;
        entity.Status = Data.Enums.MerchantStatus.Active;
        repo.Update(entity);
        _unitOfWork.SaveChanges();
        return _mapper.Map<MerchantDTO>(entity);
    }

    public MerchantDTO DeactivateMerchant(int id)
    {
        var repo = _unitOfWork.Repository<Merchant>();
        var entity = repo.GetById(id);
        if (entity == null) return null;
        entity.Status = Data.Enums.MerchantStatus.Inactive;
        repo.Update(entity);
        _unitOfWork.SaveChanges();
        return _mapper.Map<MerchantDTO>(entity);
    }

    public MerchantDTO CloseMerchant(int id)
    {
        var repo = _unitOfWork.Repository<Merchant>();
        var entity = repo.GetById(id);
        if (entity == null) return null;
        entity.Status = Data.Enums.MerchantStatus.Deleted;
        //entity.DeletedBy = deletedBy;
        entity.DeletedOn = DateTimeOffset.Now;
        repo.Update(entity);
        _unitOfWork.SaveChanges();
        return _mapper.Map<MerchantDTO>(entity);
    }
}
