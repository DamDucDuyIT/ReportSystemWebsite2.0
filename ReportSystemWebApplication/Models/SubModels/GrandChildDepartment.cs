namespace ReportSystemWebApplication.Models.SubModels
{
    public class GrandChildDepartment
    {
        public Department Department { get; set; }
        public long Unread { get; set; }
        public Report LastestReport { get; set; }
    }
}