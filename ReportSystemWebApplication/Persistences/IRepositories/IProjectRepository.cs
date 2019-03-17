using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IProjectRepository
    {
        Task<Project> GetProject(long? id, bool includeRelated = true);
        void AddProject(Project project);
        void RemoveProject(Project project);
        Task<QueryResult<Project>> GetProjects(Query queryObj);
        Task<Project> GetProjectByCode(string code, bool includeRelated = true);
        Task<QueryResult<ProjectByDepartment>> GetProjectOfUserWithEmail(Query queryObj);
    }
}
