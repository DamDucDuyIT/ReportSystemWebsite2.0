using System;
using System.Collections.Generic;

namespace ReportSystemWebApplication.Models
{
    public class Report
    {
        public Report()
        {
            CreatedOn = DateTime.Now;
            IsDeleted = false;
            IsReply = false;
            To = new HashSet<ApplicationUserReport>();
            Files = new HashSet<File>();
            HighestChildDepartmentsOfTo = new HashSet<ReportDepartment>();
            Reply = new HashSet<Report>();
            //Read = new HashSet<ApplicationUserReport>();
        }
        public long ReportId { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsReply { get; set; }
        public string Title { get; set; }
        public Project Project { get; set; }
        public Report MainReport { get; set; }
        public string Content { get; set; }
        public string ShortContent { get; set; }
        public DateTime CreatedOn { get; set; }
        public Department Department { get; set; }
        public ApplicationUser From { get; set; }
        public ICollection<ReportDepartment> HighestChildDepartmentsOfTo { get; set; }
        // public ICollection<ApplicationUserReport> Read { get; set; }
        public ICollection<ApplicationUserReport> To { get; set; }
        public ICollection<File> Files { get; set; }
        public ICollection<Report> Reply { get; set; }
    }
}
