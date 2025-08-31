namespace Data.DTOs
{
    public class ImageDTO
    {
        public int Id { get; set; }
        public string ImagePath { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
    }

}
