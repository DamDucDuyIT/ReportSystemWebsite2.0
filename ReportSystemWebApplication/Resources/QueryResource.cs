using System;

namespace ReportSystemWebApplication.Resources
{
    public class QueryResource
    {
        public string SortBy { get; set; }
        public bool IsSortAscending { get; set; }
        public int? Page { get; set; }
        public byte PageSize { get; set; }
        public long? ReportId { get; set; }
        public long? DepartmentId { get; set; }
        public long? ProjectId { get; set; }
        public long? ParentId { get; set; }
        public string ToId { get; set; }
        public string FromId { get; set; }
        public string FromEmail { get; set; }
        public string ToEmail { get; set; }
        public long? ToDepartmentId { get; set; }
        public long? FromDepartmentId { get; set; }
        public string Email { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsReply { get; set; }
        public int? Level { get; set; }
        public string SenderEmail { get; set; }
    }
}
