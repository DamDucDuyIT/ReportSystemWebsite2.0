using Microsoft.AspNetCore.Identity;
using ReportSystemWebApplication.Models;
using System.Linq;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Data
{
    public class AccountInitializer
    {
        public static async Task SeedAsync(ApplicationDbContext _context, UserManager<ApplicationUser> _userManager)
        {
            _context.Database.EnsureCreated();

            if (!_context.Users.Any())
            {

                var user = new ApplicationUser()
                {
                    Email = "a@a.com",
                    UserName = "a@a.com",
                    FullName = "WebsiteAdmin",
                    PhoneNumber = "01693848597",
                    Department = _context.Departments.FirstOrDefault(d => d.Name == "Becamex"),
                    IsActived = true
                };

                var result = await _userManager.CreateAsync(user, "abc@123");
                await _userManager.AddToRoleAsync(user, "Admin");

                if (result.Succeeded)
                {
                    user.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user);
                }

                var user2 = new ApplicationUser()
                {
                    Email = "damducduy.it@gmail.com",
                    UserName = "DamDucDuy",
                    FullName = "Department Admin",
                    PhoneNumber = "01693848597",
                    Department = _context.Departments.FirstOrDefault(d => d.Name == "R&D"),
                    IsActived = true
                };

                var result2 = await _userManager.CreateAsync(user2, "abc@123");
                await _userManager.AddToRoleAsync(user2, "Admin");

                if (result2.Succeeded)
                {
                    user2.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user2);
                }

                var user3 = new ApplicationUser()
                {
                    Email = "tranphuchau.it@gmail.com",
                    UserName = "TranPhucHau",
                    FullName = "Department Admin 2",
                    PhoneNumber = "01693848597",
                    Department = _context.Departments.FirstOrDefault(d => d.Code == "vntt"),
                    IsActived = true
                };

                var result3 = await _userManager.CreateAsync(user3, "abc@123");
                await _userManager.AddToRoleAsync(user3, "Admin");

                if (result3.Succeeded)
                {
                    user3.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user3);
                }

                // var user4 = new ApplicationUser()
                // {
                //     Email = "vntt@gmail.com",
                //     UserName = "VNTT Company",
                //     FullName = "VNTT Company Admin",
                //     PhoneNumber = "01693848597",
                //     Department = _context.Departments.FirstOrDefault(d => d.Code.Equals("vntt"))
                // };

                // var result4 = await _userManager.CreateAsync(user4, "abc@123");
                // await _userManager.AddToRoleAsync(user4, "Admin");

                // if (result4.Succeeded)
                // {
                //     user4.EmailConfirmed = true;
                //     await _userManager.UpdateAsync(user4);
                // }
            }
        }
    }
}
