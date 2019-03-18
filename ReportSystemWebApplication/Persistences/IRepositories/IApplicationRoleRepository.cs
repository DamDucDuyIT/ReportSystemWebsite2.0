using ReportSystemWebApplication.Models;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IApplicationRoleRepository
    {
        Task<ApplicationRole> GetApplicationRole(string id, bool includeRelated = true);
        void AddApplicationRole(ApplicationRole applicationRole);
        void RemoveApplicationRole(ApplicationRole applicationRole);
        Task<QueryResult<ApplicationRole>> GetApplicationRoles(Query queryObj);
    }
}
