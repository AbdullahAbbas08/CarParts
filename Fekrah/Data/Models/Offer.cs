using Data.ModelInterfaces;

namespace Data.Models
{
    public class Offer : IAuditableInsert, IAuditableUpdate
    {
        [Key]
        public int Id { get; set; }
        public double NewPrice { get; set; }
        public double DiscountRate { get; set; }

        public int PartId { get; set; }
        [ForeignKey(nameof(PartId))]
        public virtual Part Part { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }
    }
}
