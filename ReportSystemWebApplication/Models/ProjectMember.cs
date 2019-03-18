namespace ReportSystemWebApplication.Models
{
    public class ProjectMember
    {
        public long ProjectMemberId { get; set; }
        public bool IsDeleted { get; set; }
        public Project Project { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
    }
}