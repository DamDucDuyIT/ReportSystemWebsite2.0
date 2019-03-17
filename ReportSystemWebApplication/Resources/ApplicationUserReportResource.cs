namespace ReportSystemWebApplication.Resources
{
    public class ApplicationUserReportResource
    {
        public long ApplicationUserReportId { get; set; }
        public string Email { get; set; }
        public string ApplicationUserId { get; set; }
        public long? ReportId { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsRead { get; set; }
    }
}