﻿using Data.DTOs;
using Data.Models;
using Data.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Interfaces
{
    public interface IAccountService : _IBusinessService<User, UserDTO>
    {
        Task<AuthDto> Login(LoginViewModel loginViewModel);
        Task<AuthDto> RegisterNewUser(RegisterViewModel registerViewModel);
        Task<AuthDto> RegisterNewVisitor(VisitorViewModel visitorViewModel);
    }
}
