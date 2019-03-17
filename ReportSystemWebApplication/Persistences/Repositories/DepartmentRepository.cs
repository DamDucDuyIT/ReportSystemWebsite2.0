using Microsoft.EntityFrameworkCore;
using ReportSystemWebApplication.Data;
using ReportSystemWebApplication.Extensions;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using ReportSystemWebApplication.Persistences.IRepositories;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private ApplicationDbContext context;

        public DepartmentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddDepartment(Department department)
        {
            context.Departments.Add(department);
        }

        public async Task<Department> GetDepartment(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Departments.FindAsync(id);
            }
            return await context.Departments
                .Include(d => d.Children)
                .Include(d => d.Parent)
                .Include(d => d.ApplicationUsers)
                .SingleOrDefaultAsync(d => d.DepartmentId == id);
        }

        public async Task<QueryResult<ChildDepartmentOfUser>> GetChildDepartmentsOfUserWithEmail(Query queryObj)
        {
            var result = new QueryResult<ChildDepartmentOfUser>();

            var user = await context.ApplicationUsers
                        .Include(a => a.Department)
                            .ThenInclude(d => d.Children)
                        .FirstOrDefaultAsync(a => a.Email == queryObj.Email);

            var userDepartment = user.Department;

            var childDepartmentsOfUserWithEmail = new Collection<ChildDepartmentOfUser>();

            var reportsToUser = await context.Reports
                     .Include(r => r.To)
                         .ThenInclude(t => t.ApplicationUser)
                     .Include(r => r.From)
                     .Include(r => r.Files)
                     .Include(r => r.Project)
                     .Include(r => r.HighestChildDepartmentsOfTo)
                         .ThenInclude(t => t.Department)
                     .Include(r => r.Department)
                     .Include(r => r.Reply)
                     .Where(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.Email)) && r.IsReply == false)
                     .ToListAsync();

            //Tất cả///////////////////////
            var unreadCountForAll = reportsToUser.Count(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.Email) && t.IsRead == false));
            childDepartmentsOfUserWithEmail.Add(new ChildDepartmentOfUser { ChildDepartment = null, Unread = unreadCountForAll, LastestReport = reportsToUser.OrderByDescending(r => r.CreatedOn).FirstOrDefault() });
            ///////////////////////////////

            foreach (var child in userDepartment.Children)
            {
                var grandChildDepartments = new HashSet<GrandChildDepartment>();

                var childIncludeChildren = await context.Departments
                                            .Include(d => d.Children)
                                            .FirstOrDefaultAsync(d => d.DepartmentId == child.DepartmentId);

                foreach (var grandChild in childIncludeChildren.Children)
                {

                    // var lastestReportOfGrandChild = await context.Reports
                    //                .Include(r => r.Department)
                    //                .Where(r => r.Department.DepartmentId == grandChild.DepartmentId)
                    //                .OrderByDescending(r => r.CreatedOn)
                    //                .FirstOrDefaultAsync();

                    List<Report> reports = new List<Report>();
                    await AddReport(reports, grandChild, reportsToUser);

                    var lastestReportOfGrandChild = reports
                                   .OrderByDescending(r => r.CreatedOn)
                                   .FirstOrDefault();

                    var unreadForGrandChild = reports.Count(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.Email) && t.IsRead == false));

                    grandChildDepartments.Add(new GrandChildDepartment { Department = grandChild, Unread = unreadForGrandChild, LastestReport = lastestReportOfGrandChild });
                }


                List<Report> reportsOfChild = new List<Report>();
                await AddReport(reportsOfChild, child, reportsToUser);

                var lastestReportOfChild = reportsOfChild.OrderByDescending(r => r.CreatedOn)
                                            .FirstOrDefault();
                // var lastestReportOfChild = await context.Reports
                //                     .Include(r => r.Department)
                //                     .Where(r => r.Department.DepartmentId == child.DepartmentId)
                //                     .OrderByDescending(r => r.CreatedOn)
                //                     .FirstOrDefaultAsync();
                var unread = grandChildDepartments.Sum(g => g.Unread);

                childDepartmentsOfUserWithEmail.Add(new ChildDepartmentOfUser { ChildDepartment = child, Unread = unread, LastestReport = lastestReportOfChild, GrandChildDepartments = grandChildDepartments });

            }

            IQueryable<ChildDepartmentOfUser> query = childDepartmentsOfUserWithEmail.AsQueryable();

            //sort
            // var columnsMap = new Dictionary<string, Expression<Func<Department, object>>>()
            // {
            //     ["name"] = s => s.Name
            // };
            // if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            // {
            //     query = query.OrderByDescending(s => s.DepartmentId);
            // }
            // query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = query.Count();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = query.ToList();

            return result;
        }

        public async Task<List<DepartmentGraph>> GetDepartmentsByTreeGraph(Query queryObj)
        {
            var result = new QueryResult<Department>();
            var departments = await context.Departments
                    .Where(d => d.IsDeleted == false && d.Parent == null)
                    .Include(d => d.Children)
                    .Include(d => d.Parent)
                    .ToListAsync();

            List<DepartmentGraph> departmentGraph = new List<DepartmentGraph>();
            foreach (var department in departments)
            {
                var children = await AddDepartmentGraph(department);

                departmentGraph.Add(new DepartmentGraph { Department = department, Childrens = children });
            }

            return departmentGraph;
        }

        public async Task<QueryResult<Department>> GetDepartments(Query queryObj)
        {
            var result = new QueryResult<Department>();
            var query = context.Departments
                    .Where(d => d.IsDeleted == false)
                    .Include(d => d.ApplicationUsers)
                    .Include(d => d.Children)
                    .Include(d => d.Parent)
                    .AsQueryable();
            //filter
            if (queryObj.ParentId.HasValue)
            {
                query = query.Where(q => q.Parent.DepartmentId == queryObj.ParentId);
            }
            if (queryObj.Level.HasValue)
            {
                query = query.Where(q => q.Level == queryObj.Level);
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<Department, object>>>()
            {
                ["name"] = s => s.Name
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.DepartmentId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public void RemoveDepartment(Department department)
        {
            department.IsDeleted = true;
        }

        public async Task<Department> GetDepartmentByCode(string code, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Departments.FirstOrDefaultAsync(d => d.Code == code); ;
            }
            return await context.Departments
                .Include(d => d.Children)
                .Include(d => d.Parent)
                .Include(d => d.ApplicationUsers)
                .FirstOrDefaultAsync(d => d.Code == code);

        }

        //extension
        private async Task AddReport(List<Report> reports, Department child, List<Report> reportsToUser)
        {
            var department = await context.Departments
                            .Include(d => d.Children)
                            .FirstOrDefaultAsync(d => d.DepartmentId == child.DepartmentId);

            var reportsInMainDepart = reportsToUser
                                    .Where(r => r.Department.DepartmentId == department.DepartmentId)
                                    .ToList();


            reports.AddRange(reportsInMainDepart);

            foreach (var childDepartment in department.Children)
            {
                await AddReport(reports, childDepartment, reportsToUser);
            }
        }

        private async Task<List<DepartmentGraph>> AddDepartmentGraph(Department departments)
        {
            var mainChildrean = new List<DepartmentGraph>();
            foreach (var department in departments.Children)
            {
                var departmentInDatase = await context.Departments
                                         .Include(d => d.Children)
                                         .FirstOrDefaultAsync(d => d.DepartmentId == department.DepartmentId);

                var children = new List<DepartmentGraph>();
                children = await AddDepartmentGraph(departmentInDatase);

                var departmentGraph = new DepartmentGraph { Department = departmentInDatase, Childrens = children };

                mainChildrean.Add(departmentGraph);
            }

            return mainChildrean;
        }
    }
}
