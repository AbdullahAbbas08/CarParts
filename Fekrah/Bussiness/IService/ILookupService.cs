using Data.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Interfaces
{
    public interface ILookupService
    {
        List<LookupDTO> GetLookUpDetails(string lookupName, string? searchTerm = null);
    }
}
