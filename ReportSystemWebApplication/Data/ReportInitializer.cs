using ReportSystemWebApplication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Data
{
    public class ReportInitializer
    {
        public static async Task Initialize(ApplicationDbContext context)
        {
            if (context.Reports.Any())
            {
                return;   // DB has been seeded
            }

            var reports = new Report[]{
                new Report{Title = "Bao cáo DCIM", Project = context.Projects.FirstOrDefault(s =>s.Name=="DCIM"), ShortContent="Hôm nay ngủ cả ngày", Content="Hôm nay ngủ cả ngày", CreatedOn = DateTime.Now, Department = context.Departments.FirstOrDefault(d =>d.Name=="R&D"), From = context.ApplicationUsers.FirstOrDefault(a => a.Email=="damducduy.it@gmail.com"), To= new HashSet<ApplicationUserReport>{new ApplicationUserReport{ ApplicationUser = context.ApplicationUsers.FirstOrDefault(a => a.Email=="a@a.com")}}, HighestChildDepartmentsOfTo=new HashSet<ReportDepartment>{ new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name =="VNTT")}, new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name == "R&D") } } },
                new Report{Title = "Bao cáo TicketSystem", Project = context.Projects.FirstOrDefault(s =>s.Name=="Ticket System"), ShortContent="Hôm nay bị lỗi", Content="Hôm nay bị lỗi", CreatedOn = DateTime.Now, Department = context.Departments.FirstOrDefault(d =>d.Name=="R&D"),From = context.ApplicationUsers.FirstOrDefault(a => a.Email=="damducduy.it@gmail.com"), To= new HashSet<ApplicationUserReport>{new ApplicationUserReport{ ApplicationUser = context.ApplicationUsers.FirstOrDefault(a => a.Email=="a@a.com")}}, HighestChildDepartmentsOfTo=new HashSet<ReportDepartment>{ new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name =="VNTT")}, new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name == "R&D") } }},
                new Report{Title = "Bao cáo ti le chung khoang", Project = context.Projects.FirstOrDefault(s =>s.Name=="Du an 1"), ShortContent="Hôm nay ngủ lỗ 3 tỷ", Content="Hôm nay ngủ lỗ 3 tỷ", CreatedOn = DateTime.Now, Department = context.Departments.FirstOrDefault(d =>d.Code=="vntt-kd"), From = context.ApplicationUsers.FirstOrDefault(a => a.Email=="tranphuchau.it@gmail.com"), To= new HashSet<ApplicationUserReport>{new ApplicationUserReport{ ApplicationUser = context.ApplicationUsers.FirstOrDefault(a => a.Email=="a@a.com")}}, HighestChildDepartmentsOfTo=new HashSet<ReportDepartment>{ new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name =="VNTT")}, new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Code == "vntt-kd") } }},
               new Report{Title = "Bao cáo ti le thua lỗ", Project = context.Projects.FirstOrDefault(s =>s.Name=="Du an 2"), ShortContent="Tạchd dqwedqweqw eqw eqw eds dqw dqwd wqdwq dwq dqw dwqe dqw dwq dqw dsa wqedqwdqwdqwxc sacdxcdsfceqwd sc sdceqwdfwfcdscsdafewfdscvsxcweerfwevcsdvsdfwefwesdfvdsxcvsdvcweqrfewcvsdcweq  fwefewfewf  wefwe fwe few few fwe fwe few fvccvwef we v wf ewf ewr fwf wecewfwe fwcvwef we fc wcwe fwe few cv ecwee f wef cvwe few r", Content="Tạch", CreatedOn = DateTime.Now, Department = context.Departments.FirstOrDefault(d =>d.Code=="vntt-kd"), From = context.ApplicationUsers.FirstOrDefault(a => a.Email=="tranphuchau.it@gmail.com"), To= new HashSet<ApplicationUserReport>{new ApplicationUserReport{ ApplicationUser = context.ApplicationUsers.FirstOrDefault(a => a.Email=="a@a.com")}}, HighestChildDepartmentsOfTo=new HashSet<ReportDepartment>{ new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Name =="VNTT")}, new ReportDepartment { Department = context.Departments.FirstOrDefault(d => d.Code == "vntt-kd") } }},
            };

            foreach (var report in reports)
            {
                context.Reports.Add(report);
            }
            await context.SaveChangesAsync();
        }
    }
}
