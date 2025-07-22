
namespace Data.DTOs
{
    public class SellerDto
    {
        public int SellerId { get; set; }
        public int UserId { get; set; }
        public string ShopName { get; set; }
        public string PhoneNumber { get; set; }
        public string ImageUrl { get; set; }
        public string Location { get; set; }
        public double Rating { get; set; }
        public bool IsActive { get; set; }
        public string Description { get; set; }
        public int? CityId { get; set; }
        public string CityName { get; set; }
        public bool IsFavoritSeller { get; set; }
        public ICollection<SellerCategoryDto> SellerCategories { get; set; }
        public ICollection<PartDto> Parts { get; set; }
    }
}
