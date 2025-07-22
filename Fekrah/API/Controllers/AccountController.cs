using Bussiness.Interfaces;
using Data.DTOs;
using Data.Enums;
using Data.Models;
using Data.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : _BaseController<User, UserDto>
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService) : base(accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("Login")]
        public async Task<AuthDto> Login(LoginViewModel loginViewModel) => await _accountService.Login(loginViewModel);

        [HttpPost("RegisterNewUser")]
        public async Task<AuthDto> RegisterNewUser(RegisterViewModel registerViewModel) => await _accountService.RegisterNewUser(registerViewModel);

        [HttpPost("RegisterNewVisitor")]
        public async Task<AuthDto> RegisterNewVisitor(VisitorViewModel visitorViewModel) => await _accountService.RegisterNewVisitor(visitorViewModel);
    }
}
