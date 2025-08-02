namespace Data.DTOs
{
    public class MemberDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MerchantId { get; set; }
        public string Role { get; set; }
        public UserDTO MerchantMember { get; set; }
    }
}
