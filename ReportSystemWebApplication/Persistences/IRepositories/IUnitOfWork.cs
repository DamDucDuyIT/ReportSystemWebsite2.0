using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IUnitOfWork
    {
        Task Complete();
    }
}
