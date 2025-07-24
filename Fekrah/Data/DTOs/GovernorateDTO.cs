namespace Data.DTOs
{
    public class GovernorateDTO
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Name { get; set; }
        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        public UserDTO CreatedByUser { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
        public UserDTO UpdatedByUser { get; set; }
        public ICollection<CityDTO> Cities { get; set; }
    }

}
