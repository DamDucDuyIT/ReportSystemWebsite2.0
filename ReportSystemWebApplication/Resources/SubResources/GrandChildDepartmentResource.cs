namespace ReportSystemWebApplication.Resources.SubResources
{
    public class GrandChildDepartmentResource
    {
        public DepartmentResource Department { get; set; }
        public long Unread { get; set; }
        public ReportResource LastestReport { get; set; }
    }
}