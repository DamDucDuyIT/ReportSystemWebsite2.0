namespace ReportSystemWebApplication.Models
{
    public class ApplicationUserReport
    {
        public ApplicationUserReport()
        {
            IsDeleted = false;
            IsRead = IsRead;
        }
        public long ApplicationUserReportId { get; set; }
        public ApplicationUser ApplicationUser { get; set; }
        public Report Report { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsRead { get; set; }
    }
}