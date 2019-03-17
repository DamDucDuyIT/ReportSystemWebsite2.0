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
    public class ProjectRepository : IProjectRepository
    {
        private ApplicationDbContext context;

        public ProjectRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddProject(Project project)
        {
            context.Projects.Add(project);
        }

        public async Task<Project> GetProject(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Projects.FindAsync(id);
            }
            return await context.Projects
                .Include(p => p.Department)
                .Include(p => p.Reports)
                .Include(p => p.ProjectMembers)
                .SingleOrDefaultAsync(p => p.ProjectId == id);
        }

        public async Task<QueryResult<ProjectByDepartment>> GetProjectOfUserWithEmail(Query queryObj)
        {
            var result = new QueryResult<ProjectByDepartment>();

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

            var user = await context.ApplicationUsers
                        .Include(a => a.Department)
                            .ThenInclude(d => d.Children)
                        .FirstOrDefaultAsync(a => a.Email == queryObj.Email);

            var userDepartment = user.Department;

            var projectsOfUserWithEmail = new Collection<ProjectByDepartment>();

            var reports = await context.Reports
                        .Include(r => r.Project)
                        .Include(r => r.Department)
                        .Include(r => r.To)
                            .ThenInclude(t => t.ApplicationUser)
                        .Where(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.Email)))
                        .ToListAsync();

            var projectByDepartment = new Collection<ProjectByDepartment>();

            //Tất cả///////////////////////
            var unreadCountForAll = reportsToUser.Count(r => r.To.Any(t => t.ApplicationUser.Email.Equals(queryObj.Email) && t.IsRead == false) && r.Project != null);
            projectByDepartment.Add(new ProjectByDepartment { Department = null, Unread = unreadCountForAll, Projects = new List<ProjectWithUnread>() });
            ///////////////////////////////

            foreach (var childDepartment in userDepartment.Children)
            {
                var projects = new HashSet<ProjectWithUnread>();

                var getChildDepartment = await context.Departments
                              .Include(d => d.Children)
                              .FirstOrDefaultAsync(d => d.DepartmentId == childDepartment.DepartmentId);

                await AddProjectFromAllChildDepartment(reports, projects, getChildDepartment, reportsToUser, queryObj.Email);

                var unread = projects.Sum(g => g.Unread);
                if (projects.Count > 0)
                {
                    projectByDepartment.Add(new ProjectByDepartment { Department = childDepartment, Unread = unread, Projects = projects });
                }
            }

            IQueryable<ProjectByDepartment> query = projectByDepartment.AsQueryable();

            result.TotalItems = query.Count();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = query.ToList();

            return result;
        }


        public async Task<QueryResult<Project>> GetProjects(Query queryObj)
        {
            var result = new QueryResult<Project>();
            var query = context.Projects
                    .Where(d => d.IsDeleted == false)
                    .Include(p => p.Department)
                    .Include(p => p.Reports)
                    .Include(p => p.ProjectMembers)
                    .AsQueryable();

            //filter
            if (queryObj.DepartmentId.HasValue)
            {
                query = query.Where(q => q.Department.DepartmentId == queryObj.DepartmentId);
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<Project, object>>>()
            {
                ["name"] = s => s.Name,
                ["code"] = s => s.Code,
                ["description"] = s => s.Description
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.ProjectId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public void RemoveProject(Project project)
        {
            project.IsDeleted = true;
        }

        public async Task<Project> GetProjectByCode(string code, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Projects.FirstOrDefaultAsync(d => d.Code == code); ;
            }
            return await context.Projects
                           .Include(p => p.Department)
                           .Include(p => p.Reports)
                           .Include(p => p.ProjectMembers)
                                .ThenInclude(m => m.Department)
                        .FirstOrDefaultAsync(d => d.Code == code);
        }

        //extension
        private async Task AddProjectFromAllChildDepartment(List<Report> reports, HashSet<ProjectWithUnread> projects, Department department, List<Report> reportsToUser, string email)
        {
            var projectInReportInChildDepartment = reports
                                                .Where(r => r.Department.DepartmentId == department.DepartmentId && r.Project != null)
                                                .Select(r => r.Project)
                                                .ToList();

            foreach (var project in projectInReportInChildDepartment)
            {
                var reportWhichHaveProject = reportsToUser.Where(r => r.Project != null).ToList();
                var unread = reportWhichHaveProject.Count(r => r.To.Any(t => t.ApplicationUser.Email.Equals(email) && t.IsRead == false) && r.Project.ProjectId == project.ProjectId);
                projects.Add(new ProjectWithUnread { Project = project, Unread = unread });
            }

            foreach (var child in department.Children)
            {
                var childDepartment = await context.Departments
                              .Include(d => d.Children)
                              .FirstOrDefaultAsync(d => d.DepartmentId == child.DepartmentId);

                await AddProjectFromAllChildDepartment(reports, projects, childDepartment, reportsToUser, email);
            }
        }
    }
}
