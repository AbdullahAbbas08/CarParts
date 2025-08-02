public class PartFilterViewModel
{
    public int CarModel { get; set; }
    public int CarModelType { get; set; }
    public int YearOfManufactureFrom { get; set; }
    public int YearOfManufactureTo { get; set; }
    public int PartCondition { get; set; }
    public int PartQuality { get; set; }
    public int PartType { get; set; }
    public int PriceFrom { get; set; }
    public int PriceTo { get; set; }
    public int CountryOfManufacture { get; set; }
    public int QuantityFrom { get; set; }
    public int QuantityTo { get; set; }
    public DateTimeOffset? CreatedOn { get; set; }
    public bool IsSold { get; set; }
    public bool IsFavorit { get; set; }
    public bool IsDelivery { get; set; }
    public int? PartCount { get; set; }
}
