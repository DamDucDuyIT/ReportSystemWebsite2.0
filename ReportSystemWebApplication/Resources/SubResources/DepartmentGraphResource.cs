using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources.SubResources
{
    public class DepartmentGraphResource
    {
        public DepartmentResource Department { get; set; }
        public List<DepartmentGraphResource> Childrens { get; set; }
    }
}
