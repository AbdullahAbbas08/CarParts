using AutoMapper;
using Bussiness.IService;
using Data;
using Data.DTOs;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Services
{
    public class PermissionService : _BusinessService<Permission, PermissionDTO>, IPermissionService
    {
        public PermissionService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {   
        }
    }
}
