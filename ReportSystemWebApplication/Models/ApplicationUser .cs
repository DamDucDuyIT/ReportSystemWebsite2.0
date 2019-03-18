using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace ReportSystemWebApplication.Models
{
    public class ApplicationUser : IdentityUser
    {
        public ApplicationUser()
        {
            CreatedOn = DateTime.Now;
            UpdatedOn = DateTime.Now;
            IsActived = false;
            Reports = new HashSet<Report>();
            ApplicationUserReports = new HashSet<ApplicationUserReport>();
        }

        public string FullName { get; set; }
        public Department Department { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
        public ICollection<Report> Reports { get; set; }
        public ICollection<ApplicationUserReport> ApplicationUserReports { get; set; }
        public bool IsActived { get; set; }
        public bool IsDeleted { get; set; }
        public string ConfirmationCode { get; set; }

    }
}
