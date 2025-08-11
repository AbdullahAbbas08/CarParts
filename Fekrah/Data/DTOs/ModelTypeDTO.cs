namespace Data.DTOs
{
    public class ModelTypeDTO
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public int Year { get; set; }
        public int BrandId { get; set; }

        public BrandDTO? Brand { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }

    }
}
 