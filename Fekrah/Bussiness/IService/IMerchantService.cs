using Bussiness.Interfaces;
using Data.DTOs;

public interface IMerchantService : _IBusinessService<Merchant, MerchantDTO>
{
    MerchantDTO Insert(MerchantDTO dto);
    Task<MerchantDTO> Update(int id, MerchantDTO dto);
    bool Delete(int id);
    MerchantDTO GetById(int id);
    MerchantDTO ActivateMerchant(int id);
    MerchantDTO DeactivateMerchant(int id);
    MerchantDTO CloseMerchant(int id);
}