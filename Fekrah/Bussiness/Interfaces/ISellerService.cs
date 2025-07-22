using Bussiness.Helpers;
using Bussiness.Interfaces;
using Data.DTOs;
using Data.ViewModels;

public interface ISellerService : _IBusinessService<Seller, SellerDto>
{
    DataSourceResult<SellerDto> GetAllFilteredSeller(SellerFilterViewModel sellerFilterViewModel);
}

