using Data.ModelInterfaces;
using Data.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class Seller 
{
    public int Id { get; set; }
    public string ShopName { get; set; }
    public string ImageUrl { get; set; }
    public string Location { get; set; }
    public string Description { get; set; }
    public double Rating { get; set; }
    public int UserId { get; set; }
    public int? CityId { get; set; } = null;
    public bool IsFavoritSeller { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; }

    [ForeignKey(nameof(CityId))]
    public virtual City City { get; set; } = null;


    public ICollection<Part> Parts { get; set; }
    public ICollection<SellerCategory> SellerCategories { get; set; }
}

