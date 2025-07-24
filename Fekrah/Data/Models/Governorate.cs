using Data.DTOs;
using Data.ModelInterfaces;

namespace Data.Models
{
    public class Governorate : IAuditableInsert, IAuditableUpdate
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }



        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }

        // Navigation property to Cities
        public ICollection<City> Cities { get; set; } = new List<City>();
    }
}
