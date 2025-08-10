using Data.DTOs;
using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Interfaces
{
    public interface IBrandService : _IBusinessService<Brand, BrandDTO>
    {
        bool ActiveOrDeactiveBrand(int brandId, bool action);
    }
}
