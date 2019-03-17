using System;
using System.Collections.Generic;

namespace ReportSystemWebApplication.Models
{
    public class ReportDepartment
    {
        public ReportDepartment()
        {
            IsDeleted = false;
        }
        public long ReportDepartmentId { get; set; }
        public Department Department { get; set; }
        public Report Report { get; set; }
        public bool IsDeleted { get; set; }
    }
}