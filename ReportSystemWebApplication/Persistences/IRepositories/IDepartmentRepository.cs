using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.IRepositories
{
    public interface IDepartmentRepository
    {
        Task<Department> GetDepartment(long? id, bool includeRelated = true);
        void AddDepartment(Department department);
        void RemoveDepartment(Department department);
        Task<List<DepartmentGraph>> GetDepartmentsByTreeGraph(Query queryObj);
        Task<QueryResult<Department>> GetDepartments(Query queryObj);
        Task<QueryResult<ChildDepartmentOfUser>> GetChildDepartmentsOfUserWithEmail(Query queryObj);
        Task<Department> GetDepartmentByCode(string code, bool includeRelated = true);
    }
}
