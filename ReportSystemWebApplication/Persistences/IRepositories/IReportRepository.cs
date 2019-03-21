using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Resources;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IReportRepository
    {
        Task<Report> GetReport(long? id, bool includeRelated = true);
        void AddReport(Report report);
        void RemoveReport(Report report);
        Task<QueryResult<Report>> GetReports(Query queryObj);
        Task<QueryResult<Report>> GetReportsInDepartmentOfUser(Query queryObj);
        Task<QueryResult<Report>> GetReplies(Query queryObj);
        Task AddHighestChildDepartmentsOfTo(Report report, ReportResource reportResource);
        Task<long> GetNumberOfUnreadProjectReport(string email);
        Task<long> GetNumberOfUnreadDepartmentReport(string email);
    }
}
