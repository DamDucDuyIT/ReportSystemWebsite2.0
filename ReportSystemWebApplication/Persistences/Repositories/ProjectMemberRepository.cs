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
    public class ProjectMemberRepository : IProjectMemberRepository
    {
        private ApplicationDbContext context;

        public ProjectMemberRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddProjectMember(ProjectMember ProjectMember)
        {
            context.ProjectMembers.Add(ProjectMember);
        }

        public async Task<ProjectMember> GetProjectMember(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ProjectMembers.FindAsync(id);
            }
            return await context.ProjectMembers
                .Include(p => p.Project)
                .SingleOrDefaultAsync(p => p.ProjectMemberId == id);
        }

        public async Task<QueryResult<ProjectMember>> GetProjectMembers(Query queryObj)
        {
            var result = new QueryResult<ProjectMember>();
            var query = context.ProjectMembers
                    .Where(p => p.IsDeleted == false)
                    .Include(p => p.Project)
                    .AsQueryable();

            //filter
            if (queryObj.ProjectId.HasValue)
            {
                query = query.Where(q => q.Project.ProjectId == queryObj.ProjectId.Value);
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<ProjectMember, object>>>()
            {
                ["name"] = s => s.Name,
                ["email"] = s => s.Email
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ProjectMemberId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public void RemoveProjectMember(ProjectMember ProjectMember)
        {
            ProjectMember.IsDeleted = true;
        }
    }
}
