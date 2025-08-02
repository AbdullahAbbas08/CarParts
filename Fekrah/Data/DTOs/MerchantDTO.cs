using Data.Enums;

namespace Data.DTOs
{
    public class MerchantDTO
    {
        public int Id { get; set; }
        public string? Code { get; set; }
        public MerchantStatus? Status { get; set; }

        [Required, StringLength(100)]
        public string ShopName { get; set; }

        public string Slug { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public string LocationOnMap { get; set; }
        public string Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double Rating { get; set; }
        public int RatingCount { get; set; }
        public string MobileNo { get; set; }
        public string WhatsAppMobileNo { get; set; }
        public string? Email { get; set; }

        public int? GovernorateId { get; set; }
        public int? CityId { get; set; }
        public bool IsFavoriteMerchant { get; set; }
        [StringLength(20)]
        public string CommercialRegistrationNumber { get; set; }

        [StringLength(20)]
        public string NationalIdNumber { get; set; }

        [StringLength(2000)]
        public string BusinessHours { get; set; }

        public string? Logo { get; set; } // changed from byte[] to string
        public string? CommercialRegistrationImage { get; set; } // changed from byte[] to string
        public string? NationalIdImage { get; set; } // changed from byte[] to string

        [NotMapped]
        public IFormFile? NationalIdImageForm { get; set; }

        [NotMapped]
        public IFormFile? LogoForm { get; set; }

        [NotMapped]
        public IFormFile? CommercialRegistrationImageForm { get; set; }

        [NotMapped]
        public string? MembersJson { get; set; }

        public  ICollection<MemberDTO>? Members { get; set; }

        public CityDTO? City { get; set; }
        public GovernorateDTO? Governorate { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        //public ICollection<PartDTO> Parts { get; set; } 

        [NotMapped]
        public string? CategoriesJson { get; set; } 
        public List<CategoryDTO>? CategoriesDTO { get; set; }

    }
}
