using System.Collections.Generic;

namespace ReportSystemWebApplication.Models.SubModels
{
    public class ChildDepartmentOfUser
    {
        public ChildDepartmentOfUser()
        {
            GrandChildDepartments = new HashSet<GrandChildDepartment>();
        }
        public Department ChildDepartment { get; set; }
        public long Unread { get; set; }
        public Report LastestReport { get; set; }
        public ICollection<GrandChildDepartment> GrandChildDepartments { get; set; }
    }
}