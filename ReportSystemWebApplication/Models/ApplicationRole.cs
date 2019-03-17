using Microsoft.AspNetCore.Identity;
using System;

namespace ReportSystemWebApplication.Models
{
    public class ApplicationRole : IdentityRole
    {
        public ApplicationRole()
        {
            CreatedOn = DateTime.Now;
            UpdatedOn = DateTime.Now;
            IsDeleted = false;
        }
        public bool IsDeleted { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }

    }
}
