﻿using Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public UserTypeEnum UserType { get; set; }
        public string? UserTypeName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
