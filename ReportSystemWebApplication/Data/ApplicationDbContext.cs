using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReportSystemWebApplication.Models;

namespace ReportSystemWebApplication.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>().ToTable("ApplicationUser");
            builder.Entity<ApplicationUserReport>().ToTable("ApplicationUserReport");
            builder.Entity<ApplicationRole>().ToTable("ApplicationRole");
            builder.Entity<Department>().ToTable("Department");
            builder.Entity<File>().ToTable("File");
            builder.Entity<ProjectMember>().ToTable("ProjectMember");
            builder.Entity<Project>().ToTable("Project");
            builder.Entity<Report>().ToTable("Report");
            builder.Entity<ReportDepartment>().ToTable("ReportDepartment");
            //builder.Entity<Subject>().ToTable("Subject");
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<ApplicationUserReport> ApplicationUserReports { get; set; }
        public DbSet<ApplicationRole> ApplicationRoles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<File> Files { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportDepartment> ReportDepartments { get; set; }
        //public DbSet<Subject> Subjects { get; set; }
    }
}
