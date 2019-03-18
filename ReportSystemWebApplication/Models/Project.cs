using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace ReportSystemWebApplication.Models
{
    public class Project
    {
        public Project()
        {
            IsDeleted = false;
            Reports = new Collection<Report>();
            ProjectMembers = new Collection<ProjectMember>();
            CreateOn = DateTime.Now;
        }
        public long ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string CreatorEmail { get; set; }
        public DateTime CreateOn { get; set; }
        public Department Department { get; set; }
        public ICollection<Report> Reports { get; set; }
        public ICollection<ProjectMember> ProjectMembers { get; set; }
    }
}
