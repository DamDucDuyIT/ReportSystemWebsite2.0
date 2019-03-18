using System.Collections.Generic;

namespace ReportSystemWebApplication.Models.SubModels
{
    public class DepartmentGraph
    {
        public Department Department { get; set; }
        public List<DepartmentGraph> Childrens { get; set; }
    }
}
