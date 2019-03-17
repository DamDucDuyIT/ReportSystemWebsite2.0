using Microsoft.EntityFrameworkCore;
using ReportSystemWebApplication.Data;
using ReportSystemWebApplication.Extensions;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.Repositories
{
    public class ApplicationRoleRepository : IApplicationRoleRepository
    {
        private ApplicationDbContext context;

        public ApplicationRoleRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddApplicationRole(ApplicationRole applicationRole)
        {
            context.ApplicationRoles.Add(applicationRole);
        }

        public async Task<ApplicationRole> GetApplicationRole(string id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ApplicationRoles.FindAsync(id);
            }
            return await context.ApplicationRoles
                .SingleOrDefaultAsync(d => d.Id == id);
        }

        public async Task<QueryResult<ApplicationRole>> GetApplicationRoles(Query queryObj)
        {
            var result = new QueryResult<ApplicationRole>();
            var query = context.ApplicationRoles
                    .Where(d => d.IsDeleted == false)
                    .AsQueryable();

            //filter

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<ApplicationRole, object>>>()
            {
                ["name"] = s => s.Name,
                ["description"] = s => s.Description
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

        public void RemoveApplicationRole(ApplicationRole applicationRole)
        {
            applicationRole.IsDeleted = true;
        }
    }
}
