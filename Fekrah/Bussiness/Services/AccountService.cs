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

namespace Bussiness.Services
{
    public class AccountService : _BusinessService<User, UserDto>, IAccountService
    {
        private readonly JWTSetting _JWT;

        public AccountService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<JWTSetting> jWT) : base(unitOfWork, mapper)
        {
            _JWT = jWT.Value;
        }

        public async Task<AuthDto> Login(LoginViewModel loginViewModel)
        {
            var currentUser = _UnitOfWork.Repository<User>()
                .GetAll()
                .FirstOrDefault(u => u.Email.Equals(loginViewModel.Email));

            if(currentUser is null)
                return new AuthDto { Message = "الايميل غير صحيح .",  StatusCode = 500 };

            if(!GetSha256Hash(loginViewModel.Password).Equals(currentUser.PasswordHash))
                return new AuthDto { Message = "الرقم السرى غير صحيح .", StatusCode = 500 };

            if(!currentUser.IsActive)
                return new AuthDto { Message = "حسابك غير مفعل برجاء التواصل مع الأدمن .", StatusCode = 500 };

            var jwtSecurityToken = await CreateJwtToken(currentUser);

            return new AuthDto
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
                StatusCode = 200
            };

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
                FullName = registerViewModel.FullName
            };

            var result = _UnitOfWork.Repository<User>().Insert(newUser);

            return new AuthDto
            {
                UserId = result.Id,
                UserName = result.UserName,
                FullName = result.FullName,
                PhoneNumber = result.PhoneNumber,
                Photo = result.Photo,
                Message = "تم تسجيل مستخدم جديد بنجاح .",
                UserType = result.UserType,
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
                UserType = UserTypeEnum.Seller,
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
        private async Task<JwtSecurityToken> CreateJwtToken(User user)
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
