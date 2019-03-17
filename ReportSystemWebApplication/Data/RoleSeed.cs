using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Data
{
    public class RoleSeed
    {
        public static async Task SeedAsync(ApplicationDbContext _context, RoleManager<IdentityRole> _roleManager)
        {
            _context.Database.EnsureCreated();

            if (!_context.Roles.Any())
            {
                if (!_context.Roles.Any(r => r.Name == "Admin"))
                {
                    var roleAdmin = new IdentityRole
                    {
                        Name = "Admin",
                    };
                    await _roleManager.CreateAsync(roleAdmin);
                }

                if (!_context.Roles.Any(r => r.Name == "User"))
                {
                    var roleCustomer2 = new IdentityRole
                    {
                        Name = "User",
                    };
                    await _roleManager.CreateAsync(roleCustomer2);
                }
            }
        }
    }
}
