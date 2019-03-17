namespace ReportSystemWebApplication.Resources
{
    public class ProjectMemberResource
    {
        public long ProjectMemberId { get; set; }
        public bool IsDeleted { get; set; }
        public long? ProjectId { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
    }
}