using System.Collections.Generic;

namespace ReportSystemWebApplication.Models
{
    public class Department
    {
        public Department()
        {
            IsDeleted = false;
            Children = new HashSet<Department>();
            Projects = new HashSet<Project>();
        }
        public long DepartmentId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Suffix { get; set; }
        public long Level { get; set; }
        public bool IsDeleted { get; set; }
        public Department Parent { get; set; }
        public ICollection<Department> Children { get; set; }
        public ICollection<Project> Projects { get; set; }
        public ICollection<ApplicationUser> ApplicationUsers { get; set; }
    }
}
