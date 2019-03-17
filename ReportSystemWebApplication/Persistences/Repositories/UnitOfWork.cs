using ReportSystemWebApplication.Data;
using ReportSystemWebApplication.Persistences.IRepositories;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private ApplicationDbContext context;

        public UnitOfWork(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task Complete()
        {
            await context.SaveChangesAsync();
        }

    }
}
