
using Data.Enums;

namespace Data.DTOs
{
    public class PartDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Price { get; set; }
        public double FinalPrice { get; set; }
        public PartConditionEnum Condition { get; set; }
        public string ConditionName { get; set; }
        public List<string> ImageUrl { get; set; }
        public bool IsSold { get; set; }
        public bool IsFavorit { get; set; }
        public bool IsDelivery { get; set; }
        public double Discount { get; set; }
        public PartQualityEnum Quality { get; set; }
        public string QualityName { get; set; }
        public PartTypeEnum PartType { get; set; }
        public string PartTypeName { get; set; }
        public int YearOfManufacture { get; set; }
        public int? MerchantId { get; set; }
        public string MerchantName { get; set; }
        public int CategoryId { get; set; } 
        public string CategoryName { get; set; } 
        public int? CarModelId { get; set; } 
        public string? CarModelName { get; set; }
        public int? CarModelTypeId { get; set; }
        public string? CarModelTypeName { get; set; }
        public int? CountryOfManufactureId { get; set; }
        public string? CountryOfManufactureName { get; set; }
        public int Count { get; set; }
    }
}
