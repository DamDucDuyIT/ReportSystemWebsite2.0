using Microsoft.EntityFrameworkCore;
using ReportSystemWebApplication.Data;
using ReportSystemWebApplication.Extensions;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.Repositories
{
    public class ApplicationUserRepository : IApplicationUserRepository
    {
        private ApplicationDbContext context;

        public ApplicationUserRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddApplicationUser(ApplicationUser applicationUser)
        {
            context.ApplicationUsers.Add(applicationUser);
        }

        public async Task<ApplicationUser> GetApplicationUser(string id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ApplicationUsers.FindAsync(id);
            }
            return await context.ApplicationUsers
                .Include(a => a.Department)
                .Include(a => a.Reports)
                .Include(a => a.ApplicationUserReports)
                .SingleOrDefaultAsync(a => a.Id == id && a.IsActived == true);
        }

        public async Task<ApplicationUser> GetApplicationUserByEmail(string email, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ApplicationUsers.FirstOrDefaultAsync(a => a.Email == email && a.IsActived == true);
            }
            return await context.ApplicationUsers
                .Include(a => a.Department)
                 .Include(a => a.Reports)
                .Include(a => a.ApplicationUserReports)
                .SingleOrDefaultAsync(a => a.Email == email);
        }

        public async Task<QueryResult<ApplicationUser>> GetApplicationUsers(Query queryObj)
        {
            var result = new QueryResult<ApplicationUser>();
            var query = context.ApplicationUsers
                    .Where(d => d.IsDeleted == false && d.IsActived == true)
                    .Include(a => a.Department)
                    .Include(a => a.Reports)
                    .Include(a => a.ApplicationUserReports)
                    .AsQueryable();

            //filter
            if (queryObj.DepartmentId.HasValue)
            {
                query = query.Where(q => q.Department.DepartmentId == queryObj.DepartmentId);
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<ApplicationUser, object>>>()
            {
                ["fullname"] = s => s.FullName,
                ["email"] = s => s.Email
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.Id);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public async Task<QueryResult<ApplicationUser>> GetApplicationUsersInBranch(Query queryObj, long departmentId)
        {
            var result = new QueryResult<ApplicationUser>();

            //get the department of user and set it is the longest branch
            var department = await context.Departments
                                    .Include(d => d.Parent)
                                    .Include(d => d.Children)
                                    .FirstOrDefaultAsync(d => d.DepartmentId == departmentId);


            var departmentIdList = new HashSet<long>();
            departmentIdList.Add(department.DepartmentId);

            //Get all Child Department Id of department
            await AddChildDepartment(departmentIdList, department);

            //Get all Parent Department Id of Department
            await AddParentDepartment(departmentIdList, department);

            var userList = await context.ApplicationUsers
                                .Include(a => a.Department)
                                .Where(a => departmentIdList.Contains(a.Department.DepartmentId) && a.IsActived == true)
                                .ToListAsync();

            result.TotalItems = userList.Count;
            result.Items = userList;
            return result;
        }

        public void RemoveApplicationUser(ApplicationUser applicationUser)
        {
            applicationUser.IsDeleted = true;
        }

        //extensions
        public async Task AddChildDepartment(HashSet<long> childDepartmentIdList, Department department)
        {
            foreach (var child in department.Children)
            {
                var childDepartment = await context.Departments
                                    .Include(d => d.Children)
                                    .FirstOrDefaultAsync(d => d.DepartmentId == child.DepartmentId);
                childDepartmentIdList.Add(childDepartment.DepartmentId);

                await AddChildDepartment(childDepartmentIdList, childDepartment);
            }
        }

        public async Task AddParentDepartment(HashSet<long> parentDepartmentIdList, Department department)
        {
            while (department.Parent != null)
            {
                var parentDepartment = await context.Departments
                                    .Include(d => d.Parent)
                                    .FirstOrDefaultAsync(d => d.DepartmentId == (department.Parent.DepartmentId));

                parentDepartmentIdList.Add(parentDepartment.DepartmentId);

                await AddParentDepartment(parentDepartmentIdList, parentDepartment);
            }
        }

        public void UpdateUserInformation(ApplicationUser user, ApplicationUserResource applicationUserResource)
        {
            user.PhoneNumber = applicationUserResource.PhoneNumber;
            user.FullName = applicationUserResource.FullName;
        }
    }
}
