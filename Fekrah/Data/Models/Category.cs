public class Category : IAuditableInsert, IAuditableUpdate
{
    public int Id { get; set; }
    public string Name { get; set; }

    public virtual ICollection<Merchant> Merchants { get; set; }
    public ICollection<Part> Parts { get; set; }

    public int? CreatedByUserId { get; set; }
    public DateTimeOffset? CreatedOn { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }

}
