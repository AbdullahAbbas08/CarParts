using Bussiness.Interfaces;
using Data.DTOs;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.IService
{
    public interface IPermissionService : _IBusinessService<Permission, PermissionDTO>
    {
    }
}
