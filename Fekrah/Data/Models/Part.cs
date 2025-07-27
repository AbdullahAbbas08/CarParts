using Data.Enums;

public class Part
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public double FinalPrice { get; set; }
    public PartConditionEnum Condition { get; set; }
    public string ImageUrl { get; set; }
    public bool IsSold { get; set; }
    public bool IsFavorit { get; set; } = false;
    public bool IsDelivery { get; set; } = false;
    public double Discount { get; set; } = 0.0;
    public PartQualityEnum Quality { get; set; }
    public PartTypeEnum PartType { get; set; }
    [Required, MaxLength(4)]
    public int YearOfManufacture { get; set; }

    public int MerchantId { get; set; }
    [ForeignKey(nameof(MerchantId))]
    public Merchant Merchant { get; set; }

    public int CountryOfManufactureId { get; set; }
    [ForeignKey(nameof(CountryOfManufactureId))]
    public CountryOfManufacture CountryOfManufacture { get; set; }

    public int CarModelTypeId { get; set; }
    [ForeignKey(nameof(CarModelTypeId))]
    public ModelType CarModelType { get; set; }

    public virtual ICollection<Offer> Offers { get; set; }

    // Add Category relation
    public int CategoryId { get; set; }
    public virtual Category Category { get; set; }
}
