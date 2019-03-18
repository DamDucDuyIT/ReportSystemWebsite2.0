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
    public class ReportRepository : IReportRepository
    {
        private ApplicationDbContext context;

        public ReportRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddReport(Report report)
        {
            context.Reports.Add(report);
        }

        public async Task<Report> GetReport(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Reports.FindAsync(id);
            }
            var report = await context.Reports
                .Include(r => r.To)
                    .ThenInclude(t => t.ApplicationUser)
                .Include(r => r.From)
                .Include(r => r.Files)
                .Include(r => r.Project)
                .Include(r => r.HighestChildDepartmentsOfTo)
                    .ThenInclude(t => t.Department)
                .Include(r => r.Department)
                .Include(r => r.Reply)
                    .ThenInclude(re => re.To)
                        .ThenInclude(t => t.ApplicationUser)
                //.Include(r => r.Read)
                .SingleOrDefaultAsync(r => r.ReportId == id);

            if (report.Reply != null)
            {
                report.Reply = report.Reply.OrderByDescending(r => r.CreatedOn).ToList();
            }

            return report;
        }

        public async Task<QueryResult<Report>> GetReplies(Query queryObj)
        {
            var result = new QueryResult<Report>();
            var query = context.Reports
                    .Where(r => r.IsDeleted == false && r.IsReply == true)
                    .Include(r => r.From)
                      .Include(r => r.To)
                        .ThenInclude(t => t.ApplicationUser)
                    .Include(r => r.MainReport)
                    .AsQueryable();

            //filter
            if (queryObj.FromEmail != null)
            {
                query = query.Where(q => q.From.Email == queryObj.FromEmail);
            }
            if (queryObj.ToEmail != null)
            {
                query = query.Where(q => q.To.Any(t => t.ApplicationUser.Email == queryObj.ToEmail));
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<Report, object>>>()
            {
                ["project"] = s => s.Project.Name,
                ["datetime"] = s => s.CreatedOn
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ReportId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            //paging errorring
            //query = query.ApplyPaging(queryObj);

            var listOfReplies = await query.ToListAsync();
            var mainReport = new HashSet<Report>();
            foreach (var reply in listOfReplies)
            {
                var report = await context.Reports
                      .Include(r => r.To)
                        .ThenInclude(t => t.ApplicationUser)
                      .Include(r => r.From)
                      .Include(r => r.Files)
                      .Include(r => r.Project)
                      .Include(r => r.HighestChildDepartmentsOfTo)
                        .ThenInclude(t => t.Department)
                      .Include(r => r.Department)
                      .Include(r => r.Reply)
                      .FirstOrDefaultAsync(r => r.ReportId == reply.MainReport.ReportId && r.IsDeleted == false);

                mainReport.Add(report);
            }

            result.TotalItems = mainReport.Count();

            result.Items = mainReport;

            foreach (var item in result.Items)
            {
                if (item.Reply != null)
                {
                    item.Reply = item.Reply.OrderByDescending(r => r.CreatedOn).ToList();
                }

            }

            return result;
        }

        public async Task<QueryResult<Report>> GetReportsInDepartmentOfUser(Query queryObj)
        {
            var result = new QueryResult<Report>();
            var department = await context.Departments
                            .AsNoTracking()
                            .FirstOrDefaultAsync(d => d.DepartmentId == queryObj.DepartmentId && d.IsDeleted == false);

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
                                    .ThenInclude(re => re.To)
                                        .ThenInclude(t => t.ApplicationUser)
                                .Where(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.ToEmail)) && r.IsReply == false)
                                .AsNoTracking()
                                .ToListAsync();

            List<Report> reports = new List<Report>();

            await AddReport(reports, department, reportsToUser);

            var query = reports.AsQueryable();

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<Report, object>>>()
            {
                ["project"] = s => s.Project.Name,
                ["datetime"] = s => s.CreatedOn
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ReportId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            //paging
            query = query.ApplyPaging(queryObj);

            result.TotalItems = reports.Count;

            result.Items = query.ToList();

            result.Items.OrderByDescending(r => r.ReportId);

            foreach (var item in result.Items)
            {
                if (item.Reply != null)
                {
                    item.Reply = item.Reply.OrderByDescending(r => r.CreatedOn).ToList();
                }
            }

            return result;
        }

        public async Task<QueryResult<Report>> GetReports(Query queryObj)
        {
            var result = new QueryResult<Report>();
            var query = context.Reports
                    .Where(r => r.IsDeleted == false && r.IsReply == false)
                      .Include(r => r.To)
                        .ThenInclude(t => t.ApplicationUser)
                      .Include(r => r.From)
                      .Include(r => r.Files)
                      .Include(r => r.Project)
                      .Include(r => r.HighestChildDepartmentsOfTo)
                        .ThenInclude(t => t.Department)
                      .Include(r => r.Department)
                      .Include(r => r.Reply)
                        .ThenInclude(re => re.To)
                            .ThenInclude(t => t.ApplicationUser)
                       .Include(r => r.Reply)
                        .ThenInclude(re => re.From)
                    .AsNoTracking()
                    //.Include(r => r.Read)
                    .AsQueryable();

            //filter
            if (queryObj.SenderEmail != null)
            {
                query = query.Where(q => q.From.Email == queryObj.SenderEmail || q.Reply.Any(r => r.From.Email == queryObj.SenderEmail));
            }
            if (queryObj.IsReply)
            {
                query = query.Where(q => q.IsReply == queryObj.IsReply);
            }
            if (queryObj.FromId != null)
            {
                query = query.Where(q => q.From.Id == queryObj.FromId);
            }
            if (queryObj.FromEmail != null)
            {
                query = query.Where(q => q.From.Email == queryObj.FromEmail);
            }
            if (queryObj.ToId != null)
            {
                query = query.Where(q => q.To.Any(t => t.ApplicationUser.Id == queryObj.ToId));
            }
            if (queryObj.ToEmail != null)
            {
                query = query.Where(q => q.To.Any(t => t.ApplicationUser.Email == queryObj.ToEmail));
            }
            if (queryObj.DepartmentId != null)
            {
                query = query.Where(q => q.Department.DepartmentId == queryObj.DepartmentId);
            }
            // if (queryObj.SubjectId != null)
            // {
            //     query = query.Where(q => q.Subject.SubjectId == queryObj.SubjectId);
            // }
            if (queryObj.ProjectId != null)
            {
                query = query.Where(q => q.Project.ProjectId == queryObj.ProjectId);
            }
            if (queryObj.ToDepartmentId != null)
            {
                query = query.Where(q => q.HighestChildDepartmentsOfTo.Any(h => h.Department.DepartmentId == queryObj.ToDepartmentId));
            }

            // if (queryObj.FromDepartmentId != null)
            // {
            //     query = query.Where(q => q.HighestChildDepartmentsOfTo.Any(h => h.DepartmentId == queryObj.ToDepartmentId));
            // }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<Report, object>>>()
            {
                ["project"] = s => s.Project.Name,
                ["datetime"] = s => s.CreatedOn
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ReportId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            foreach (var item in result.Items)
            {
                if (item.Reply != null)
                {
                    item.Reply = item.Reply.OrderByDescending(r => r.CreatedOn).ToList();
                }

            }

            return result;
        }

        public void RemoveReport(Report report)
        {
            report.IsDeleted = true;
        }

        public async Task AddHighestChildDepartmentsOfTo(Report report, ReportResource reportResource)
        {
            var highestChildDepartmentsOfTo = new HashSet<Department>();
            foreach (var email in reportResource.ToEmails)
            {
                var user = await context.ApplicationUsers
                            .Include(a => a.Department)
                            .AsNoTracking()
                            .FirstOrDefaultAsync(a => a.Email == email);

                var userDepartment = await context.Departments
                                    .Include(d => d.Children)
                                        .ThenInclude(c => c.Children)
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync();

                if (userDepartment.Children.Any(c => c.DepartmentId == report.Department.DepartmentId))
                {
                    //report.HighestChildDepartmentsOfTo.Add(report.Department);
                    report.HighestChildDepartmentsOfTo.Add(new ReportDepartment { IsDeleted = false, Department = report.Department });
                }
                else
                {
                    foreach (var department in userDepartment.Children)
                    {
                        await findDepartmentOfToUserFromReportDepartment(department, report, 1);
                    }
                }

            }
        }

        //extensions
        private async Task AddReport(List<Report> reports, Department child, List<Report> reportsToUser)
        {
            var department = await context.Departments
                            .Include(d => d.Children)
                            .AsNoTracking()
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
        private async Task<bool> findDepartmentOfToUserFromReportDepartment(Department department, Report report, int level)
        {
            if (department.Children.Any(c => c.DepartmentId == report.Department.DepartmentId) && level == 1)
            {
                //report.HighestChildDepartmentsOfTo.Add(department);
                //report.HighestChildDepartmentsOfTo.Add(report.Department);
                report.HighestChildDepartmentsOfTo.Add(new ReportDepartment { IsDeleted = false, Department = department });
                report.HighestChildDepartmentsOfTo.Add(new ReportDepartment { IsDeleted = false, Department = report.Department });
                return true;
            }

            foreach (var child in department.Children)
            {
                var childDepartment = await context.Departments
                                        .Include(d => d.Children)
                                        .Include(d => d.Parent)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(d => d.DepartmentId == child.DepartmentId);

                var check = await findDepartmentOfToUserFromReportDepartment(childDepartment, report, level + 1);
                if (check == true && level == 1)
                {
                    //report.HighestChildDepartmentsOfTo.Add(department);
                    //report.HighestChildDepartmentsOfTo.Add(childDepartment);
                    report.HighestChildDepartmentsOfTo.Add(new ReportDepartment { IsDeleted = false, Department = department });
                    report.HighestChildDepartmentsOfTo.Add(new ReportDepartment { IsDeleted = false, Department = childDepartment });
                }
                if (check == true)
                {
                    return true;
                }
            }

            return false;
        }

    }
}
