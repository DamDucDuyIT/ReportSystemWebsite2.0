using System;
using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources
{
    public class ProjectResource
    {
        public long ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string CreatorEmail { get; set; }
        public DateTime CreateOn { get; set; }
        public long? DepartmentId { get; set; }
        public ICollection<long> Reports { get; set; }
        public ICollection<ProjectMemberResource> ProjectMembers { get; set; }
    }
}
