using ReportSystemWebApplication.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Data
{
    public class DbInitializer
    {
        public static async Task Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any Department.
            if (context.Departments.Any())
            {
                return;   // DB has been seeded
            }
            var rootDepartment = new Department { Name = "Becamex", Level = 1, Code = "becamex", Suffix = "@becamex.com.vn" };
            context.Departments.Add(rootDepartment);
            await context.SaveChangesAsync();

            var mainDepartment = new Department { Name = "VNTT", Level = 2, Code = "vntt", Parent = context.Departments.FirstOrDefault(d => d.Name == "Becamex"), Suffix = "@vntt.com.vn" };
            context.Departments.Add(mainDepartment);
            await context.SaveChangesAsync();
            var subDepartment1 = new Department { Name = "Kinh Doanh", Code = "vntt-kd", Level = 3, Parent = context.Departments.FirstOrDefault(d => d.Name == "VNTT"), Suffix = "@vntt.com.vn" };
            var subDepartment2 = new Department { Name = "R&D", Code = "vntt-rd", Level = 3, Parent = context.Departments.FirstOrDefault(d => d.Name == "VNTT"), Suffix = "@vntt.com.vn" };
            context.Departments.Add(subDepartment1);
            context.Departments.Add(subDepartment2);
            await context.SaveChangesAsync();

            var mainDepartment2 = new Department { Name = "EIU", Level = 2, Code = "eiu", Parent = context.Departments.FirstOrDefault(d => d.Name == "Becamex"), Suffix = "@eiu.edu.vn" };
            context.Departments.Add(mainDepartment2);
            await context.SaveChangesAsync();
            var subDepartment3 = new Department { Name = "Kinh Doanh", Code = "eiu-kd", Level = 3, Parent = context.Departments.FirstOrDefault(d => d.Name == "EIU"), Suffix = "@eiu.edu.vn" };
            var subDepartment4 = new Department { Name = "Nhân sự", Code = "eiu-ns", Level = 3, Parent = context.Departments.FirstOrDefault(d => d.Name == "EIU"), Suffix = "@eiu.edu.vn" };
            context.Departments.Add(subDepartment3);
            context.Departments.Add(subDepartment4);
            await context.SaveChangesAsync();


            var projects = new Project[]{
                new Project{Name="DCIM", Department = context.Departments.FirstOrDefault(d => d.Name == "R&D"),Code="001", Description="Quản lý data center", From =DateTime.Parse("2/2/2019"), To =DateTime.Parse("12/12/2019")},
                new Project{Name="Ticket System", Department = context.Departments.FirstOrDefault(d => d.Name == "R&D"),Code="002", Description="Quản lý ticket trong công ty vntt", From =DateTime.Parse("1/1/2019"), To =DateTime.Parse("10/10/2019")},
                new Project{Name="BBI", Department = context.Departments.FirstOrDefault(d => d.Name == "R&D"),Code="003", Description="Tạo bườn ươm doanh nghiệp", From =DateTime.Parse("12/12/2018"), To =DateTime.Parse("5/5/2019")},
                new Project{Name="Du an 1", Department = context.Departments.FirstOrDefault(d => d.Code == "vntt-kd"),Code="004", Description="Dự án dự trù cho công ty becamex", From =DateTime.Parse("11/10/2018"), To =DateTime.Parse("7/5/2019")},
                new Project{Name="Du an 2", Department = context.Departments.FirstOrDefault(d => d.Code == "vntt-kd"),Code="005", Description="Thiết kế website phòng chống ma tuý", From =DateTime.Parse("1/2/2019"), To =DateTime.Parse("8/10/2019")},
                new Project{Name="Du an 3", Department = context.Departments.FirstOrDefault(d => d.Code == "vntt-kd"),Code="006", Description="Thiết kế website mua bán anime tại Việt Nam", From =DateTime.Parse("3/2/2019"), To =DateTime.Parse("10/11/2019")},
            };
            foreach (var project in projects)
            {
                context.Projects.Add(project);
            }
            await context.SaveChangesAsync();

        }
    }
}
