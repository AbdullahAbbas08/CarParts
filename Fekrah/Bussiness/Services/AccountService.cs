using AutoMapper;
using Bussiness.Interfaces;
using Data;
using Data.DTOs;
using Data.Enums;
using Data.Models;
using Data.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Data;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Bussiness.Helpers;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace Bussiness.Services
{
    public class AccountService : _BusinessService<User, UserDTO>, IAccountService
    {
        private readonly JWTSetting _JWT;

        public AccountService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<JWTSetting> jWT) : base(unitOfWork, mapper)
        {
            _JWT = jWT.Value;
        }

        public async Task<AuthDto> Login(LoginViewModel loginViewModel)
        {
            int? merchantId = null;
            UserRole? lastSelectedRole = null;
            AuthDto returned = new();

            var currentUser = _UnitOfWork.Repository<User>()
                .GetAll()
                .Include(u => u.UserRoles)
                .ThenInclude(r => r.Role)
                .ThenInclude(p => p.Permissions)
                .FirstOrDefault(u => u.Email.Equals(loginViewModel.Email));

            if(currentUser is null)
                return new AuthDto { Message = "الايميل غير صحيح .",  StatusCode = 500 };

            if(!GetSha256Hash(loginViewModel.Password).Equals(currentUser.PasswordHash))
                return new AuthDto { Message = "الرقم السرى غير صحيح .", StatusCode = 500 };

            if(!currentUser.IsActive)
                return new AuthDto { Message = "حسابك غير مفعل برجاء التواصل مع الأدمن .", StatusCode = 500 };

            // Check if current user has (Merchant) user type
            if(currentUser.UserType == UserTypeEnum.Merchant)
            {
                merchantId = _UnitOfWork.Repository<Member>()
                    .GetAll()
                    .FirstOrDefault(m => m.UserId == currentUser.Id)?
                    .MerchantId;
            }

            // Get Role & Permissions For Current User
            if (currentUser.UserRoles.Any())
            {
                lastSelectedRole = currentUser.UserRoles.FirstOrDefault(r => r.IsLastSelected);

                if (lastSelectedRole is not null)
                {
                    returned.RoleId = lastSelectedRole.RoleId;
                    returned.RoleName = lastSelectedRole.Role.RoleNameAr;
                    returned.Permissions = lastSelectedRole.Role.Permissions.Select(p => p.PermissionCode).ToList();
                }
            }


            var jwtSecurityToken = await CreateJwtToken(currentUser, lastSelectedRole is not null ? lastSelectedRole.UserRoleId : null, merchantId);

            returned = new AuthDto
            {
                UserId = currentUser.Id,
                UserName = currentUser.UserName,
                FullName = currentUser.FullName,
                PhoneNumber = currentUser.PhoneNumber,
                Photo = currentUser.Photo,
                IsAuthenticated = true,
                Token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
                Message = "LoggedIn Successfully !",
                UserType = currentUser.UserType,
                IsAdmin = currentUser.UserType == UserTypeEnum.Admin ? true : false,
                StatusCode = 200,
            };

            return returned;

        }

        public async Task<AuthDto> RegisterNewUser(RegisterViewModel registerViewModel)
        {
            var currentUser = _UnitOfWork.Repository<User>()
                .GetAll()
                .FirstOrDefault(u => u.UserName.Equals(registerViewModel.UserName));

            if (currentUser is not null)
                return new AuthDto { Message = "اسم المستخدم موجود بالفعل.", StatusCode = 500 };

            User newUser = new User
            {
                UserName = registerViewModel.UserName,
                PhoneNumber = registerViewModel.PhoneNumber,
                Email = registerViewModel.Email,
                Photo = registerViewModel.Photo,
                PasswordHash = GetSha256Hash(registerViewModel.Password),
                Address = registerViewModel.Address,
                IsActive = true,
                UserType = registerViewModel.UserType,
                FullName = registerViewModel.FullName,
                NationalId = "مصرى"
            };

            var result = _UnitOfWork.Repository<User>().Insert(newUser);

            // Add Role For New User If Exist
            if (registerViewModel.RoleId.HasValue)
            {
                _UnitOfWork.Repository<UserRole>()
                    .Insert(new UserRole
                    {
                        RoleId = registerViewModel.RoleId.Value,
                        UserId = result.Id,
                        IsLastSelected = true
                    });
            }

            return new AuthDto
            {
                UserId = result.Id,
                UserName = result.UserName,
                FullName = result.FullName,
                PhoneNumber = result.PhoneNumber,
                Photo = result.Photo,
                Message = "تم تسجيل مستخدم جديد بنجاح .",
                UserType = result.UserType,
                UserTypeName = Enum.GetName(result.UserType),
                IsAdmin = result.UserType == UserTypeEnum.Admin ? true : false,
                StatusCode = 200
            };
        }

        public async Task<AuthDto> RegisterNewVisitor(VisitorViewModel visitorViewModel)
        {
            var currentVisitor = _UnitOfWork.Repository<VisitorRegister>()
                .GetAll()
                .FirstOrDefault(v => v.UserName.Equals(visitorViewModel.UserName));

            if(currentVisitor is not null)
                return new AuthDto { Message = "لقد قمت بالتسجيل لدينا من قبل .", StatusCode = 500 };

            VisitorRegister newVisitorRegister = new()
            {
                UserName = visitorViewModel.UserName,
                Email = visitorViewModel.Email,
                Address = visitorViewModel.Address,
                FullName = visitorViewModel.FullName,
                PhoneNumber= visitorViewModel.PhoneNumber,
            };

            var result = _UnitOfWork.Repository<VisitorRegister>().Insert(newVisitorRegister);

            return new AuthDto
            {
                UserId = result.Id,
                UserName = result.UserName,
                FullName = result.FullName,
                PhoneNumber = result.PhoneNumber,
                Message = "تم ارسال طلبك بنجاح .",
                UserType = UserTypeEnum.Merchant,
                IsAdmin =  false,
                StatusCode = 200
            };
        }


        private string GetSha256Hash(string input)
        {
            using (var hashAlgorithm = new SHA256CryptoServiceProvider())
            {
                var byteValue = Encoding.UTF8.GetBytes(input);
                var byteHash = hashAlgorithm.ComputeHash(byteValue);
                return Convert.ToBase64String(byteHash);
            }
        }
        private async Task<JwtSecurityToken> CreateJwtToken(User user, int? userRoleId = null, int? merchantId = null)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.UserData, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim("UserType", ((int)user.UserType).ToString()),
            };

            if (merchantId.HasValue && merchantId > 0)
                claims.Append(new Claim("MerchantId", merchantId.ToString()));

            if(userRoleId.HasValue && userRoleId > 0)
                claims.Append(new Claim("UserRoleId", userRoleId.ToString()));

            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_JWT.Key));
            var signingCardentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

            var jwtSecurityToken = new JwtSecurityToken
            (
                issuer: _JWT.Issuer,
                audience: _JWT.Audience,
                claims: claims,
                expires: DateTime.Now.AddDays(_JWT.AccessTokenExpirationMinutes),
                signingCredentials: signingCardentials
            );

            return jwtSecurityToken;
        }
    }
}
