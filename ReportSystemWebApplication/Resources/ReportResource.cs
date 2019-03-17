using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources
{
    public class ReportResource
    {
        public long ReportId { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsReply { get; set; }
        public string Title { get; set; }
        public long? ProjectId { get; set; }
        public long? MainReportId { get; set; }
        public string Content { get; set; }
        public string ShortContent { get; set; }
        public string CreatedOn { get; set; }
        public long? DepartmentId { get; set; }
        public string FromId { get; set; }
        public string FromEmail { get; set; }
        public ICollection<long> HighestChildDepartmentsOfTo { get; set; }
        //public ICollection<long> Read { get; set; }
        public ICollection<ApplicationUserReportResource> To { get; set; }
        public ICollection<string> ToEmails { get; set; }
        public ICollection<FileResource> Files { get; set; }
        public ICollection<ReportResource> Reply { get; set; }
    }
}
