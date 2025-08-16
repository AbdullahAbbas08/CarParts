using AutoMapper;
using Bussiness.IService;
using Data;
using Data.DTOs;
using Data.Models;
using Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace Bussiness.Services
{
    public class OfferService : _BusinessService<Offer, OfferDTO>, IOfferService
    {
        public OfferService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
        }

        public override OfferDTO Insert(OfferDTO dto)
        {
            Validate(dto);
            var result = base.Insert(dto);
            if (result != null)
            {
                RecalculatePartPricing(result.PartId);
            }
            return result;
        }

        public override OfferDTO Update(OfferDTO dto)
        {
            Validate(dto);
            var result = base.Update(dto);
            if (result != null)
            {
                RecalculatePartPricing(result.PartId);
            }
            return result;
        }

        private void Validate(OfferDTO dto)
        {
            if (dto.Type == OfferTypeEnum.Percentage && (dto.DiscountRate is null or < 0 or > 100))
                throw new ArgumentException("DiscountRate ??? ?? ???? ??? 0 ? 100");
            if (dto.Type == OfferTypeEnum.FixedAmount && (dto.FixedAmount is null or <= 0))
                throw new ArgumentException("FixedAmount ????? ?????");
            if (dto.Type == OfferTypeEnum.NewPrice && (dto.NewPrice is null or <= 0))
                throw new ArgumentException("NewPrice ????? ?????");
            if (dto.Type == OfferTypeEnum.BuyXGetY && (dto.BuyQuantity is null or <= 0 || dto.GetQuantity is null or <= 0))
                throw new ArgumentException("BuyQuantity ? GetQuantity ??????? ???????");
            if (dto.Type == OfferTypeEnum.Bundle && string.IsNullOrWhiteSpace(dto.BundlePartIdsCsv))
                throw new ArgumentException("BundlePartIdsCsv ????? ?? ???? ??????");
            if (dto.EndAt.HasValue && dto.StartAt.HasValue && dto.EndAt < dto.StartAt)
                throw new ArgumentException("EndAt ?? ???? ?? ???? ??? StartAt");
        }

        public override OfferDTO Delete(object id)
        {
            var offer = _UnitOfWork.Repository<Offer>().GetById(id);
            var result = base.Delete(id);
            if (offer != null && result != null)
            {
                RecalculatePartPricing(offer.PartId);
            }
            return result;
        }

        public void RecalculatePartPricing(int partId)
        {
            var partRepo = _UnitOfWork.Repository<Part>();
            var part = partRepo.GetAll().Include(p => p.Offers).FirstOrDefault(p => p.Id == partId);
            if (part == null) return;

            // ?? ?????? ??????? ??? ?????
            var now = DateTimeOffset.UtcNow;
            var activeOffers = part.Offers?
                .Where(o => o.IsActive && (!o.StartAt.HasValue || o.StartAt <= now) && (!o.EndAt.HasValue || o.EndAt >= now))
                .OrderByDescending(o => o.Id)
                .ToList();

            if (activeOffers == null || !activeOffers.Any())
            {
                part.FinalPrice = part.Price;
                part.Discount = 0;
            }
            else
            {
                // ?????????? ?????: ?????? ??? ??? (??????)
                var offer = activeOffers.First();
                switch (offer.Type)
                {
                    case OfferTypeEnum.NewPrice:
                        if (offer.NewPrice > 0)
                        {
                            part.FinalPrice = offer.NewPrice.Value;
                            part.Discount = part.Price > 0 ? (part.Price - part.FinalPrice) / part.Price * 100.0 : 0;
                        }
                        break;
                    case OfferTypeEnum.Percentage:
                        if (offer.DiscountRate > 0 && offer.DiscountRate <= 100)
                        {
                            part.Discount = offer.DiscountRate.Value;
                            part.FinalPrice = part.Price * (1 - offer.DiscountRate.Value / 100.0);
                        }
                        break;
                    case OfferTypeEnum.FixedAmount:
                        if (offer.FixedAmount > 0)
                        {
                            var final = part.Price - offer.FixedAmount.Value;
                            if (final < 0) final = 0;
                            part.FinalPrice = final;
                            part.Discount = part.Price > 0 ? (part.Price - final) / part.Price * 100.0 : 0;
                        }
                        break;
                    case OfferTypeEnum.BuyXGetY:
                        // ?? ???? ?????? ??? ??? ??????? ???? ?????? ????? ?? ????? ?????
                        part.FinalPrice = part.Price;
                        part.Discount = 0;
                        break;
                    case OfferTypeEnum.Bundle:
                        // ?????? ???? ????? ??? ????? ?????? ??? ?? ????? ?????
                        part.FinalPrice = part.Price;
                        part.Discount = 0;
                        break;
                    default:
                        part.FinalPrice = part.Price;
                        part.Discount = 0;
                        break;
                }
            }
            partRepo.Update(part);
        }
    }
}
