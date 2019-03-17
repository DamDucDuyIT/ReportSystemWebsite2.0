using ReportSystemWebApplication.Models;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IFileRepository
    {
        Task<File> GetFile(long? id, bool includeRelated = true);
        void AddFile(File file);
        void RemoveFile(File file);
        Task<QueryResult<File>> GetFiles(Query queryObj);
    }
}
