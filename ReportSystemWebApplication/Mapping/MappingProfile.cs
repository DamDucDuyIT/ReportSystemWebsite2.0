using AutoMapper;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using ReportSystemWebApplication.Resources;
using ReportSystemWebApplication.Resources.SubResources;
using System.Globalization;
using System.Linq;

namespace ReportSystemWebApplication.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            ////Domain to API Resource
            CreateMap<ApplicationRole, ApplicationRoleResource>();

            CreateMap<ApplicationUser, ApplicationUserResource>()
                .ForMember(ar => ar.DepartmentId, opt => opt.MapFrom(a => a.Department.DepartmentId))
                .ForMember(ar => ar.DepartmentName, opt => opt.MapFrom(a => a.Department.Name))
                .ForMember(ar => ar.Reports, opt => opt.MapFrom(a => a.Reports.Select(af => af.ReportId)))
                .ForMember(ar => ar.ApplicationUserReports, opt => opt.MapFrom(a => a.ApplicationUserReports.Select(af => af.ApplicationUserReportId)));

            CreateMap<ApplicationUserReport, ApplicationUserReportResource>()
                .ForMember(ar => ar.Email, opt => opt.MapFrom(a => a.ApplicationUser.Email))
                .ForMember(ar => ar.ReportId, opt => opt.MapFrom(a => a.Report.ReportId))
                .ForMember(ar => ar.ApplicationUserId, opt => opt.MapFrom(a => a.ApplicationUser.Id));

            CreateMap<Department, DepartmentResource>()
                //.ForMember(dr => dr.Children, opt => opt.MapFrom(d => d.Children.Select(df => df.DepartmentId)))
                .ForMember(dr => dr.ApplicationUsers, opt => opt.MapFrom(d => d.ApplicationUsers.Select(df => df.Id)))
                .ForMember(dr => dr.Projects, opt => opt.MapFrom(d => d.Projects.Select(df => df.ProjectId)))
                .ForMember(dr => dr.ParentId, opt => opt.MapFrom(d => d.Parent.DepartmentId));

            CreateMap<File, FileResource>()
                .ForMember(fr => fr.ReportId, opt => opt.MapFrom(f => f.Report.ReportId));

            CreateMap<ProjectMember, ProjectMemberResource>()
                .ForMember(pr => pr.ProjectId, opt => opt.MapFrom(p => p.Project.ProjectId));


            CreateMap<Project, ProjectResource>()
                .ForMember(pr => pr.DepartmentId, opt => opt.MapFrom(p => p.Department.DepartmentId))
                .ForMember(pr => pr.Reports, opt => opt.MapFrom(p => p.Reports.Select(pf => pf.ReportId)))
                .ForMember(pr => pr.From, opt => opt.MapFrom(p => p.From.ToString("dd/M/yyyy hh:mm:ss", CultureInfo.InvariantCulture)))
                .ForMember(pr => pr.To, opt => opt.MapFrom(p => p.To.ToString("dd/M/yyyy hh:mm:ss", CultureInfo.InvariantCulture)));

            CreateMap<Report, ReportResource>()
                .ForMember(rr => rr.DepartmentId, opt => opt.MapFrom(r => r.Department.DepartmentId))
                .ForMember(rr => rr.ProjectId, opt => opt.MapFrom(r => r.Project.ProjectId))
                .ForMember(rr => rr.FromId, opt => opt.MapFrom(r => r.From.Id))
                .ForMember(rr => rr.MainReportId, opt => opt.MapFrom(r => r.MainReport.ReportId))
                .ForMember(rr => rr.FromEmail, opt => opt.MapFrom(r => r.From.Email))
                .ForMember(rr => rr.HighestChildDepartmentsOfTo, opt => opt.MapFrom(r => r.HighestChildDepartmentsOfTo.Select(rf => rf.Department.DepartmentId)))
                //.ForMember(rr => rr.Read, opt => opt.MapFrom(r => r.Read.Select(rf => rf.ApplicationUserReportId)))
                //.ForMember(rr => rr.To, opt => opt.MapFrom(r => r.To.Select(rf => rf.ApplicationUserReportId)))
                .ForMember(rr => rr.ToEmails, opt => opt.MapFrom(r => r.To.Select(rf => rf.ApplicationUser.Email)))
                //.ForMember(rr => rr.Files, opt => opt.MapFrom(r => r.Files.Select(rf => rf.FileId)))
                .ForMember(rr => rr.ProjectName, opt => opt.MapFrom(r => r.Project != null ? r.Project.Name : null))
                .ForMember(rr => rr.Reply, opt => opt.MapFrom(r => r.Reply.Select(rf => rf)))
                .ForMember(rr => rr.CreatedOn, opt => opt.MapFrom(r => r.CreatedOn.ToString("dd/M/yyyy hh:mm:ss", CultureInfo.InvariantCulture)));

            CreateMap<ReportDepartment, ReportDepartmentResource>()
                .ForMember(rr => rr.ReportId, opt => opt.MapFrom(r => r.Report.ReportId))
                .ForMember(rr => rr.DepartmentId, opt => opt.MapFrom(r => r.Department.DepartmentId));

            CreateMap(typeof(QueryResult<>), typeof(QueryResultResource<>));

            CreateMap<ChildDepartmentOfUser, ChildDepartmentOfUserResource>();

            CreateMap<GrandChildDepartment, GrandChildDepartmentResource>();

            CreateMap<ProjectByDepartment, ProjectByDepartmentResource>();

            CreateMap<ProjectWithUnread, ProjectWithUnreadResource>();

            CreateMap<DepartmentGraph, DepartmentGraphResource>();

            //API Resource to domain   
            CreateMap<QueryResource, Query>();

            CreateMap<ApplicationRoleResource, ApplicationRole>()
                .ForMember(a => a.Id, opt => opt.Ignore());

            CreateMap<ApplicationUserResource, ApplicationUser>()
                .ForMember(a => a.Id, opt => opt.Ignore())
                .ForMember(a => a.Department, opt => opt.Ignore())
                .ForMember(a => a.Reports, opt => opt.Ignore())
                .ForMember(a => a.ApplicationUserReports, opt => opt.Ignore())
                .ForMember(a => a.Email, opt => opt.Ignore());

            CreateMap<ApplicationUserReportResource, ApplicationUserReport>()
                .ForMember(a => a.ApplicationUserReportId, opt => opt.Ignore())
                .ForMember(a => a.Report, opt => opt.Ignore())
                .ForMember(a => a.ApplicationUser, opt => opt.Ignore());

            CreateMap<DepartmentResource, Department>()
                .ForMember(d => d.DepartmentId, opt => opt.Ignore())
                .ForMember(d => d.Parent, opt => opt.Ignore())
                .ForMember(d => d.Children, opt => opt.Ignore())
                .ForMember(d => d.Projects, opt => opt.Ignore())
                .ForMember(d => d.ApplicationUsers, opt => opt.Ignore());

            CreateMap<FileResource, File>()
                .ForMember(f => f.FileId, opt => opt.Ignore())
                .ForMember(f => f.Report, opt => opt.Ignore());

            CreateMap<ProjectMemberResource, ProjectMember>()
                .ForMember(p => p.ProjectMemberId, opt => opt.Ignore())
                .ForMember(p => p.Project, opt => opt.Ignore());

            CreateMap<ProjectResource, Project>()
                .ForMember(f => f.ProjectId, opt => opt.Ignore())
                .ForMember(f => f.Department, opt => opt.Ignore())
                .ForMember(f => f.Reports, opt => opt.Ignore());

            CreateMap<ReportResource, Report>()
                .ForMember(r => r.ReportId, opt => opt.Ignore())
                .ForMember(r => r.Department, opt => opt.Ignore())
                .ForMember(r => r.Project, opt => opt.Ignore())
                .ForMember(r => r.From, opt => opt.Ignore())
                .ForMember(r => r.HighestChildDepartmentsOfTo, opt => opt.Ignore())
                //.ForMember(r => r.Read, opt => opt.Ignore())
                .ForMember(r => r.To, opt => opt.Ignore())
                .ForMember(r => r.Reply, opt => opt.Ignore())
                .ForMember(r => r.Files, opt => opt.Ignore())
                .ForMember(r => r.CreatedOn, opt => opt.Ignore());

            CreateMap<ReportDepartmentResource, ReportDepartment>()
              .ForMember(r => r.ReportDepartmentId, opt => opt.Ignore())
              .ForMember(r => r.Report, opt => opt.Ignore())
              .ForMember(r => r.Department, opt => opt.Ignore());

        }
    }
}
