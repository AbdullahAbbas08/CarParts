﻿using Bussiness.Interfaces;
using Data.DTOs;

public interface IMerchantService : _IBusinessService<Merchant, MerchantDTO>
{
    MerchantDTO Insert(MerchantDTO dto);
    MerchantDTO Update(int id, MerchantDTO dto);
    bool Delete(int id);
    MerchantDTO GetById(int id);
}
 