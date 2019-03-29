using ReportSystemWebApplication.Models;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IApplicationUserReportRepository
    {
        Task<ApplicationUserReport> GetApplicationUserReport(long? id, bool includeRelated = true);
        Task<ApplicationUserReport> GetApplicationUserReportByEmail(string email, bool includeRelated = true);
        void AddApplicationUserReport(ApplicationUserReport applicationUserReport);
        void RemoveApplicationUserReport(ApplicationUserReport applicationUserReport);
        Task<QueryResult<ApplicationUserReport>> GetApplicationUserReports(Query queryObj);
    }
}
