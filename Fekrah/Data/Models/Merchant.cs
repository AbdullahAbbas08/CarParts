public class Merchant : IAuditableInsert, IAuditableUpdate, IAuditableDelete
{
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string ShopName { get; set; }

    public string Logo { get; set; }
    public string Slug { get; set; } 

    [StringLength(500)]
    public string Description { get; set; }
    public string ShortDescription { get; set; }

    public string Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public double Rating { get; set; }
    public int RatingCount { get; set; }

    public int? GovernorateId  { get; set; }
    public int? CityId { get; set; }
    public bool IsFavoriteMerchant { get; set; }

    public virtual ICollection<User> Members { get; set; } = new List<User>();

    [ForeignKey(nameof(CityId))]
    public virtual City City { get; set; }

    [ForeignKey("GovernorateId")]
    public virtual Governorate Governorate  { get; set; }

    public ICollection<Part> Parts { get; set; } = new List<Part>();
    public ICollection<SellerCategory> SellerCategories { get; set; } = new List<SellerCategory>();

    [StringLength(20)]
    public string CommercialRegistrationNumber { get; set; } 

    public string CommercialRegistrationImage { get; set; } 

    [StringLength(20)]
    public string NationalIdNumber { get; set; }  

    public string NationalIdImage { get; set; }

    public int? DeletedBy { get; set; }
    public DateTimeOffset? DeletedOn { get; set; }

    public int? UpdatedBy { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }

    public int? CreatedByUserId { get; set; }
    public DateTimeOffset? CreatedOn { get; set; }
}

