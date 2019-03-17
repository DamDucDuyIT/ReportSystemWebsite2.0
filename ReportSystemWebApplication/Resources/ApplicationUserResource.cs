using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources
{
    public class ApplicationUserResource : IdentityUser
    {
        // public long Id { get; set; }
        public string FullName { get; set; }
        // public string Email { get; set; }
        // public string PhoneNumber { get; set; }
        public long? DepartmentId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
        public bool IsActived { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<long> Reports { get; set; }
        public ICollection<long> ApplicationUserReports { get; set; }
        public string ConfirmationCode { get; set; }

        //extra information
        public string DepartmentName { get; set; }
    }
}
