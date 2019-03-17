using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources.SubResources
{
    public class ChildDepartmentOfUserResource
    {
        public DepartmentResource ChildDepartment { get; set; }
        public long Unread { get; set; }
        public ReportResource LastestReport { get; set; }
        public ICollection<GrandChildDepartmentResource> GrandChildDepartments { get; set; }
    }
}