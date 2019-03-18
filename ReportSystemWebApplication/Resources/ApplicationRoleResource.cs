using System;

namespace ReportSystemWebApplication.Resources
{
    public class ApplicationRoleResource
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
    }
}
