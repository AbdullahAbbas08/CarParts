namespace Data.Models
{
    public class Brand : IAuditableInsert, IAuditableUpdate
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }
        public string Code { get; set; }

        public string ImageUrl { get; set; }

        public bool IsActive { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }

        [NotMapped]
        public int ModelTypesCount => ModelTypes?.Count ?? 0;

        public ICollection<ModelType> ModelTypes { get; set; }
    }
}
