using System.Threading.Tasks;
using ReportSystemWebApplication.Models;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IProjectMemberRepository
    {
        Task<ProjectMember> GetProjectMember(long? id, bool includeRelated = true);
        void AddProjectMember(ProjectMember ProjectMember);
        void RemoveProjectMember(ProjectMember ProjectMember);
        Task<QueryResult<ProjectMember>> GetProjectMembers(Query queryObj);
    }
}
