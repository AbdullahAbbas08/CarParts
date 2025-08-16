using Data.Enums;

namespace Data.DTOs
{
    public class OfferDTO
    {
        public int Id { get; set; }
        public OfferTypeEnum Type { get; set; }
        public double? NewPrice { get; set; }
        public double? DiscountRate { get; set; }
        public double? FixedAmount { get; set; }
        public int? BuyQuantity { get; set; }
        public int? GetQuantity { get; set; }
        public int? FreePartId { get; set; }
        public string? BundlePartIdsCsv { get; set; }

        // PromoCode fields
        public string? PromoCode { get; set; }
        public int? UsageLimit { get; set; }
        public int? PerUserLimit { get; set; }
        public int? TimesUsed { get; set; }
        public double? MinOrderSubtotal { get; set; }

        public DateTimeOffset? StartAt { get; set; }
        public DateTimeOffset? EndAt { get; set; }
        public bool IsActive { get; set; }
        public int PartId { get; set; }
        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
    }
}
