namespace ReportSystemWebApplication.Models
{
    public class FCMToken
    {
        public long FCMTokenId { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public bool IsDeleted { get; set; }
    }
}