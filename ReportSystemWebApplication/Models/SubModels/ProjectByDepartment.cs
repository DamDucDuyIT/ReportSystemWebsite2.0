using System.Collections.Generic;

namespace ReportSystemWebApplication.Models.SubModels
{
    public class ProjectByDepartment
    {
        public ProjectByDepartment()
        {
            Projects = new HashSet<ProjectWithUnread>();
        }
        public long Unread { get; set; }
        public Department Department { get; set; }
        public ICollection<ProjectWithUnread> Projects { get; set; }
    }
}
