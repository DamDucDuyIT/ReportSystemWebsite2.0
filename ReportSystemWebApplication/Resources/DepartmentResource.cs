using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources
{
    public class DepartmentResource
    {
        public long DepartmentId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Suffix { get; set; }
        public bool IsDeleted { get; set; }
        public long Level { get; set; }
        public long? ParentId { get; set; }
        public ICollection<DepartmentResource> Children { get; set; }
        public ICollection<long> Projects { get; set; }
        public ICollection<string> ApplicationUsers { get; set; }
    }
}
