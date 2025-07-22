public class Part
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public PartConditionEnum Condition { get; set; }
    public string ImageUrl { get; set; }
    public bool IsSold { get; set; }

    public int SellerId { get; set; }
    [ForeignKey(nameof(SellerId))]
    public Merchant Seller { get; set; }

    public int CarsModelId { get; set; }
    [ForeignKey(nameof(CarsModelId))]
    public CarsModel CarsModel { get; set; }

    public virtual ICollection<Offer> Offers { get; set; }

    // Add Category relation
    public int CategoryId { get; set; }
    public Category Category { get; set; }
}
