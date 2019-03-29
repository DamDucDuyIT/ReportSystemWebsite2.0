using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Resources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IApplicationUserRepository
    {
        Task<ApplicationUser> GetApplicationUser(string id, bool includeRelated = true);
        Task<ApplicationUser> GetApplicationUserByEmail(string email, bool includeRelated = true);
        void AddApplicationUser(ApplicationUser applicationUser);
        void RemoveApplicationUser(ApplicationUser applicationUser);
        Task<QueryResult<ApplicationUser>> GetApplicationUsers(Query queryObj);
        void UpdateUserInformation(ApplicationUser user, ApplicationUserResource applicationUserResource);
        Task<QueryResult<ApplicationUser>> GetApplicationUsersInBranch(Query queryObj, long departmentId);
        void AddFCMToken(FCMToken fcmToken);
        Task<IEnumerable<FCMToken>> GetFCMTokensOfEmail(string email);
    }
}
