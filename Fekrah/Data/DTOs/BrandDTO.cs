namespace Data.DTOs
{
    public class BrandDTO
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public string Code { get; set; }

        public string ImageUrl { get; set; }
        public int? ModelTypesCount { get; set; }
        public bool? IsActive { get; set; }

        public ICollection<PartDTO>? Parts { get; set; }
        public ICollection<ModelTypeDTO>? ModelTypes { get; set; }
    }
}
