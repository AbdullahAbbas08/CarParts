namespace Data.DTOs
{
    public class GovernorateLookupDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class CityLookupDto
    {
        public int Id { get; set; }
        public string NameAr { get; set; }
        public int GovernorateId { get; set; }
    }
}
