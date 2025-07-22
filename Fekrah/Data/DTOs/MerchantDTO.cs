
namespace Data.DTOs
{
    public class MerchantDTO
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string ShopName { get; set; }

        public string LogoUrl { get; set; }
        public string Slug { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
        public string ShortDescription { get; set; }

        public string Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double Rating { get; set; }
        public int RatingCount { get; set; }
        public int? CityId { get; set; }
        public bool IsFavoriteMerchant { get; set; }

        public virtual ICollection<UserDTO > Members { get; set; } = new List<UserDTO>();

        public virtual CityDTO City { get; set; }

        public ICollection<PartDTO> Parts { get; set; } = new List<PartDTO>();
        public ICollection<SellerCategoryDTO> SellerCategories { get; set; } = new List<SellerCategoryDTO>();



        public int? DeletedBy { get; set; }
        public DateTimeOffset? DeletedOn { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
    }
}
