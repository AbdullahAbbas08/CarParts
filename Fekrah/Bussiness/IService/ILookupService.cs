using Data.DTOs;
using System.Collections.Generic;

namespace Bussiness.Interfaces
{
    public interface ILookupService
    {
        List<LookupDTO> GetLookUpDetails(string lookupName, string? searchTerm = null);
        List<GovernorateLookupDto> GetGovernorates();
        List<CityLookupDto> GetCities(int? governorateId = null);
    }
}
