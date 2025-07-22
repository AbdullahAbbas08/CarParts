using Data.Enums;
using Data.ModelInterfaces;

namespace Data.Models
{
    public class User : IAuditableInsert, IAuditableUpdate
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? Photo { get; set; }
        public UserTypeEnum UserType { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SellerId { get; set; }

        [ForeignKey(nameof(SellerId))]
        public virtual Seller? Seller { get; set; }

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

