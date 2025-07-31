using Data.Enums;

public class Merchant : IAuditableInsert, IAuditableUpdate, IAuditableDelete
{
    public int Id { get; set; }
    public string Code { get; set; }
    public MerchantStatus? Status { get; set; }

    [Required, StringLength(100)]
    public string ShopName { get; set; }

    public string Logo { get; set; } // changed from byte[] to string
    public string? Email { get; set; }
    public string MobileNo { get; set; }
    public string WhatsAppMobileNo { get; set; }
    public string Slug { get; set; }

    [StringLength(500)]
    public string Description { get; set; }
    public string ShortDescription { get; set; }

    public string Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string LocationOnMap { get; set; }

    public double Rating { get; set; }
    public int RatingCount { get; set; }

    public int? GovernorateId { get; set; }
    public int? CityId { get; set; }
    public bool IsFavoriteMerchant { get; set; }

    public virtual ICollection<Member> Members { get; set; }

    [ForeignKey(nameof(CityId))]
    public virtual City City { get; set; }

    [ForeignKey("GovernorateId")]
    public virtual Governorate Governorate { get; set; }

    public ICollection<Part> Parts { get; set; }
    public virtual ICollection<Category> Categories { get; set; }

    [StringLength(20)]
    public string CommercialRegistrationNumber { get; set; }

    public string CommercialRegistrationImage { get; set; } // changed from byte[] to string

    [StringLength(20)]
    public string NationalIdNumber { get; set; }

    public string NationalIdImage { get; set; } // changed from byte[] to string

    [StringLength(2000)]
    public string BusinessHours { get; set; } // ساعات العمل بصيغة JSON

    public int? DeletedBy { get; set; }
    public DateTimeOffset? DeletedOn { get; set; }

    public int? UpdatedBy { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }

    public int? CreatedByUserId { get; set; }
    public DateTimeOffset? CreatedOn { get; set; }
}

