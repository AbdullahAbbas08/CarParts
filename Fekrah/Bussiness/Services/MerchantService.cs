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

public class MerchantService : _BusinessService<Merchant, MerchantDTO>, IMerchantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly string _mainImagePath;
    private readonly string _backupImagePath;
    private readonly string _webRootPath;

    public MerchantService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, IHostingEnvironment webHostEnvironment) : base(unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _mainImagePath = configuration["MerchantImagePaths:Main"];
        _backupImagePath = configuration["MerchantImagePaths:Backup"];
        _webRootPath = webHostEnvironment.ContentRootPath;
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
        return fileName.Replace("\\", "/");
    }

    public MerchantDTO Insert(MerchantDTO dto)
    {
        try
        {
            var MerchantCount = _unitOfWork.Repository<Merchant>().GetAll().Count();
            if (MerchantCount == 0) MerchantCount = 1;
            dto.Code = DateTime.Now.Year.ToString().Substring(2, 2) +
                       DateTime.Now.Month.ToString("00") +
                       (MerchantCount + 1).ToString("000000");

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

            var newMembers = JsonSerializer.Deserialize<List<MemberDTO>>(dto.MembersJson) ?? new List<MemberDTO>();
            List<Member> MerchantMembers = new List<Member>();
            foreach (var item in newMembers)
            {
                if (!_unitOfWork.Repository<User>().GetAll().Any(e =>
                    (!string.IsNullOrEmpty(item.MerchantMember.UserName) && e.UserName == item.MerchantMember.UserName)
                    || (!string.IsNullOrEmpty(item.MerchantMember.NationalId) && e.NationalId == item.MerchantMember.NationalId)
                    || (!string.IsNullOrEmpty(item.MerchantMember.PhoneNumber) && e.PhoneNumber == item.MerchantMember.PhoneNumber)
                ))
                {
                    var _user = _mapper.Map<User>(item.MerchantMember);
                    _unitOfWork.Repository<User>().Insert(_user);
                    MerchantMembers.Add(new Member { UserId = _user.Id });
                }
                else
                {
                    var _user = _unitOfWork.Repository<User>().GetAll().FirstOrDefault(e =>
                        (!string.IsNullOrEmpty(item.MerchantMember.UserName) && e.UserName == item.MerchantMember.UserName)
                        || (!string.IsNullOrEmpty(item.MerchantMember.NationalId) && e.NationalId == item.MerchantMember.NationalId)
                        || (!string.IsNullOrEmpty(item.MerchantMember.PhoneNumber) && e.PhoneNumber == item.MerchantMember.PhoneNumber)
                    );
                    MerchantMembers.Add(new Member { UserId = _user.Id });
                }
            }

            var newCategories = !string.IsNullOrEmpty(dto.CategoriesJson) ? JsonSerializer.Deserialize<List<CategoryDTO>>(dto.CategoriesJson) : dto.CategoriesDTO;
            var entity = _mapper.Map<Merchant>(dto);

            if (MerchantMembers.Count() > 0)
                entity.Members = MerchantMembers;

            // ربط التصنيفات المختارة مع إضافة الجديد
            if (newCategories != null && newCategories.Any())
            {
                var categoriesToAdd = new List<Category>();
                foreach (var catDto in newCategories)
                {
                    if (catDto.Id > 0)
                    {
                        var existingCat = _unitOfWork.Repository<Category>().GetById(catDto.Id);
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

    public async Task<MerchantDTO> Update(int id, MerchantDTO dto)
    {
        try
        {
            var repo = _unitOfWork.Repository<Merchant>();
            var entity = await repo.GetAll().Include(x => x.Members).Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return null;

            bool isChanged = false;

            // Update only changed properties
            if (dto.ShopName != null && dto.ShopName != entity.ShopName)
            {
                entity.ShopName = dto.ShopName;
                isChanged = true;
            }
            if (dto.Slug != null && dto.Slug != entity.Slug)
            {
                entity.Slug = dto.Slug;
                isChanged = true;
            }
            if (dto.Description != null && dto.Description != entity.Description)
            {
                entity.Description = dto.Description;
                isChanged = true;
            }
            if (dto.ShortDescription != null && dto.ShortDescription != entity.ShortDescription)
            {
                entity.ShortDescription = dto.ShortDescription;
                isChanged = true;
            }
            if (dto.LocationOnMap != null && dto.LocationOnMap != entity.LocationOnMap)
            {
                entity.LocationOnMap = dto.LocationOnMap;
                isChanged = true;
            }
            if (dto.Address != null && dto.Address != entity.Address)
            {
                entity.Address = dto.Address;
                isChanged = true;
            }
            if (dto.Latitude != null && dto.Latitude != entity.Latitude)
            {
                entity.Latitude = dto.Latitude;
                isChanged = true;
            }
            if (dto.Longitude != null && dto.Longitude != entity.Longitude)
            {
                entity.Longitude = dto.Longitude;
                isChanged = true;
            }
            if (dto.Rating != entity.Rating)
            {
                entity.Rating = dto.Rating;
                isChanged = true;
            }
            if (dto.RatingCount != entity.RatingCount)
            {
                entity.RatingCount = dto.RatingCount;
                isChanged = true;
            }
            if (dto.MobileNo != null && dto.MobileNo != entity.MobileNo)
            {
                entity.MobileNo = dto.MobileNo;
                isChanged = true;
            }
            if (dto.WhatsAppMobileNo != null && dto.WhatsAppMobileNo != entity.WhatsAppMobileNo)
            {
                entity.WhatsAppMobileNo = dto.WhatsAppMobileNo;
                isChanged = true;
            }
            if (dto.Email != null && dto.Email != entity.Email)
            {
                entity.Email = dto.Email;
                isChanged = true;
            }
            if (dto.GovernorateId != null && dto.GovernorateId != entity.GovernorateId)
            {
                entity.GovernorateId = dto.GovernorateId;
                isChanged = true;
            }
            if (dto.CityId != null && dto.CityId != entity.CityId)
            {
                entity.CityId = dto.CityId;
                isChanged = true;
            }
            if (dto.IsFavoriteMerchant != entity.IsFavoriteMerchant)
            {
                entity.IsFavoriteMerchant = dto.IsFavoriteMerchant;
                isChanged = true;
            }
            if (dto.CommercialRegistrationNumber != null && dto.CommercialRegistrationNumber != entity.CommercialRegistrationNumber)
            {
                entity.CommercialRegistrationNumber = dto.CommercialRegistrationNumber;
                isChanged = true;
            }
            if (dto.NationalIdNumber != null && dto.NationalIdNumber != entity.NationalIdNumber)
            {
                entity.NationalIdNumber = dto.NationalIdNumber;
                isChanged = true;
            }
            if (dto.BusinessHours != null && dto.BusinessHours != entity.BusinessHours)
            {
                entity.BusinessHours = dto.BusinessHours;
                isChanged = true;
            }
            if (dto.Status != null && dto.Status != entity.Status)
            {
                entity.Status = dto.Status;
                isChanged = true;
            }

            // Handle images
            if (dto.CommercialRegistrationImageForm != null)
            {
                var fileName = SaveImageToPaths(dto.CommercialRegistrationImageForm);
                entity.CommercialRegistrationImage = fileName;
                isChanged = true;
            }
            if (dto.NationalIdImageForm != null)
            {
                var fileName = SaveImageToPaths(dto.NationalIdImageForm);
                entity.NationalIdImage = fileName;
                isChanged = true;
            }
            if (dto.LogoForm != null)
            {
                var fileName = SaveImageToPaths(dto.LogoForm);
                entity.Logo = fileName;
                isChanged = true;
            }

            // Update Members if changed
            if (!string.IsNullOrEmpty(dto.MembersJson))
            {
                var newMembers = JsonSerializer.Deserialize<List<MemberDTO>>(dto.MembersJson) ?? new List<MemberDTO>();
                List<Member> MerchantMembers = new List<Member>();
                foreach (var item in newMembers)
                {
                    if (!_unitOfWork.Repository<User>().GetAll().Any(e =>
                        (!string.IsNullOrEmpty(item.MerchantMember.UserName) && e.UserName == item.MerchantMember.UserName)
                        || (!string.IsNullOrEmpty(item.MerchantMember.NationalId) && e.NationalId == item.MerchantMember.NationalId)
                        || (!string.IsNullOrEmpty(item.MerchantMember.PhoneNumber) && e.PhoneNumber == item.MerchantMember.PhoneNumber)
                    ))
                    {
                        var _user = _mapper.Map<User>(item);
                        _unitOfWork.Repository<User>().Insert(_user);

                        if (!entity.Members.Select(x => x.UserId).Contains(_user.Id))
                            MerchantMembers.Add(new Member { MerchantId = id, UserId = _user.Id });
                    }
                    else
                    {
                        var _user = _unitOfWork.Repository<User>().GetAll().FirstOrDefault(e =>
                            (!string.IsNullOrEmpty(item.MerchantMember.UserName) && e.UserName == item.MerchantMember.UserName)
                            || (!string.IsNullOrEmpty(item.MerchantMember.NationalId) && e.NationalId == item.MerchantMember.NationalId)
                            || (!string.IsNullOrEmpty(item.MerchantMember.PhoneNumber) && e.PhoneNumber == item.MerchantMember.PhoneNumber)
                        );

                        if (!entity.Members.Select(x => x.UserId).Contains(_user.Id))
                            MerchantMembers.Add(new Member { MerchantId = id, UserId = _user.Id });
                    }
                }
                if (entity.Members == null ) entity.Members = new List<Member>();

                if(MerchantMembers.Count() > 0)
                entity.Members = MerchantMembers;
                isChanged = true;
            }

            // Update Categories if changed
            var newCategories = !string.IsNullOrEmpty(dto.CategoriesJson) ? JsonSerializer.Deserialize<List<CategoryDTO>>(dto.CategoriesJson) : dto.CategoriesDTO;
            if (newCategories != null)
            {
                entity.Categories.Clear();
                var categoriesToAdd = new List<Category>();
                foreach (var catDto in newCategories)
                {
                    if (catDto.Id > 0)
                    {
                        var existingCat = _unitOfWork.Repository<Category>().GetById(catDto.Id);
                        if (existingCat != null)
                            categoriesToAdd.Add(existingCat);
                    }
                }
                entity.Categories = categoriesToAdd;
                isChanged = true;
            }

            if (isChanged)
            {
                repo.Update(entity);
                _unitOfWork.SaveChanges();
            }
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
                .Include(m => m.Members).ThenInclude(x => x.MerchantMember)
                .Include(x => x.City)
                .ThenInclude(x => x.Governorate)
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
