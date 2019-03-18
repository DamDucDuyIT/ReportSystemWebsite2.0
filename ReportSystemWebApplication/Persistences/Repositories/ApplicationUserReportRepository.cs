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
    public class ApplicationUserReportRepository : IApplicationUserReportRepository
    {
        private ApplicationDbContext context;

        public ApplicationUserReportRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddApplicationUserReport(ApplicationUserReport applicationUserReport)
        {
            context.ApplicationUserReports.Add(applicationUserReport);
        }

        public async Task<ApplicationUserReport> GetApplicationUserReport(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ApplicationUserReports.FindAsync(id);
            }
            return await context.ApplicationUserReports
                .Include(d => d.Report)
                .Include(d => d.ApplicationUser)
                .SingleOrDefaultAsync(d => d.ApplicationUserReportId == id);
        }

        public async Task<ApplicationUserReport> GetApplicationUserReportByEmail(string email, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.ApplicationUserReports
                            .Include(a => a.ApplicationUser)
                            .FirstOrDefaultAsync(a => a.ApplicationUser.Email == email);
            }
            return await context.ApplicationUserReports
                .Include(d => d.Report)
                .Include(d => d.ApplicationUser)
                .SingleOrDefaultAsync(d => d.ApplicationUser.Email == email);
        }

        public async Task<QueryResult<ApplicationUserReport>> GetApplicationUserReports(Query queryObj)
        {
            var result = new QueryResult<ApplicationUserReport>();
            var query = context.ApplicationUserReports
                    .Where(d => d.IsDeleted == false)
                     .Include(d => d.Report)
                    .Include(d => d.ApplicationUser)
                    .AsNoTracking()
                    .AsQueryable();

            //filter

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<ApplicationUserReport, object>>>()
            {
                //["name"] = s => s.Name
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ApplicationUserReportId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public void RemoveApplicationUserReport(ApplicationUserReport applicationUserReport)
        {
            applicationUserReport.IsDeleted = true;
        }

    }
}
