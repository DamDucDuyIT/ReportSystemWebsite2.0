namespace ReportSystemWebApplication.Resources
{
    public class ReportDepartmentResource
    {
        public long ReportDepartmentId { get; set; }
        public long? DepartmentId { get; set; }
        public long? ReportId { get; set; }
        public bool IsDeleted { get; set; }
    }
}