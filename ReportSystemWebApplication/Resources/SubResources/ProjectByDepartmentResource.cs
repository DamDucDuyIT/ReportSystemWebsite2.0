using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources.SubResources
{
    public class ProjectByDepartmentResource
    {
        public DepartmentResource Department { get; set; }
        public long Unread { get; set; }
        public ICollection<ProjectWithUnreadResource> Projects { get; set; }
    }
}
