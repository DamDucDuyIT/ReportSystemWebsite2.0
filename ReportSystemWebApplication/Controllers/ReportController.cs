using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ReportSystemWebApplication.Hubs;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/reports")]
    public class ReportController : Controller
    {
        private IReportRepository reportRepository;
        private IMapper mapper;
        private IDepartmentRepository departmentRepository;
        private IApplicationUserRepository applicationUserRepository;
        private IProjectRepository projectRepository;
        private IUnitOfWork unitOfWork;
        private IApplicationUserReportRepository applicationUserReportRepository;
        private IHubContext<ReportSystemHub> hubContext;

        public ReportController(IReportRepository reportRepository, IMapper mapper,
            IDepartmentRepository departmentRepository, IApplicationUserRepository applicationUserRepository,
            IProjectRepository projectRepository, IHubContext<ReportSystemHub> hubContext,
            IApplicationUserReportRepository applicationUserReportRepository, IUnitOfWork unitOfWork)
        {
            this.reportRepository = reportRepository;
            this.mapper = mapper;
            this.departmentRepository = departmentRepository;
            this.applicationUserRepository = applicationUserRepository;
            this.projectRepository = projectRepository;
            this.unitOfWork = unitOfWork;
            this.applicationUserReportRepository = applicationUserReportRepository;
            this.hubContext = hubContext;
        }
        // GET: api/reports/getreportsindepartmentofuser
        [HttpGet]
        [Route("getnumberofunreadreportdepartment/{email}")]
        public async Task<IActionResult> GetNumberOfUnreadDepartmentReport(string email)
        {
            var numberOfUnread = await reportRepository.GetNumberOfUnreadDepartmentReport(email);
            return Ok(numberOfUnread);
        }

        // GET: api/reports/getreportsindepartmentofuser
        [HttpGet]
        [Route("getnumberofunreadreportproject/{email}")]
        public async Task<IActionResult> GetNumberOfUnreadProjecttReport(string email)
        {
            var numberOfUnread = await reportRepository.GetNumberOfUnreadProjectReport(email);
            return Ok(numberOfUnread);
        }

        // GET: api/reports/getreportsindepartmentofuser
        [HttpGet]
        [Route("getreportsindepartmentofuser")]
        public async Task<QueryResultResource<ReportResource>> GetReportsInDepartmentOfUser(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the reports with filter and sorting form of the query
            var queryResult = await reportRepository.GetReportsInDepartmentOfUser(query);

            //convert all of reports into reportResource json
            return mapper.Map<QueryResult<Report>, QueryResultResource<ReportResource>>(queryResult);
        }

        // GET: api/reports/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<ReportResource>> GetReports(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the reports with filter and sorting form of the query
            var queryResult = await reportRepository.GetReports(query);

            //convert all of reports into reportResource json
            return mapper.Map<QueryResult<Report>, QueryResultResource<ReportResource>>(queryResult);
        }

        // GET: api/reports/getallreplies
        [HttpGet]
        [Route("getallreplies")]
        public async Task<QueryResultResource<ReportResource>> GetReplies(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the reports with filter and sorting form of the query
            var queryResult = await reportRepository.GetReplies(query);

            //convert all of reports into reportResource json
            return mapper.Map<QueryResult<Report>, QueryResultResource<ReportResource>>(queryResult);
        }

        // GET: api/reports/getreport/5
        [HttpGet]
        [Route("getreport/{id}")]
        public async Task<IActionResult> GetReport(long id)
        {
            //get report for converting to json result
            var report = await reportRepository.GetReport(id);

            //check if report with the id dont exist in the database
            if (report == null)
            {
                return NotFound();
            }

            // converting report object to json result
            var reportResource = mapper.Map<Report, ReportResource>(report);

            return Ok(reportResource);
        }

        // POST: api/reports/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateReport([FromBody] ReportResource reportResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //map reportResource json into report model
            var report = mapper.Map<ReportResource, Report>(reportResource);

            //update createOn datetime
            report.CreatedOn = DateTime.Now;

            //add project for report
            if (reportResource.ProjectId != null)
            {
                report.Project = await projectRepository.GetProject(reportResource.ProjectId, false);
            }


            //add from applicationUser
            var fromUser = await applicationUserRepository.GetApplicationUserByEmail(reportResource.FromEmail, true);
            report.From = fromUser;

            //add department for report
            report.Department = await departmentRepository.GetDepartment(reportResource.DepartmentId, false);

            //add main report if is reply
            if (reportResource.MainReportId != null)
            {
                report.MainReport = await reportRepository.GetReport(reportResource.MainReportId, false);
            }

            //add To applicationUser
            report.To.Clear();
            foreach (var email in reportResource.ToEmails)
            {
                var applicationUser = await applicationUserRepository.GetApplicationUserByEmail(email, false);
                report.To.Add(new ApplicationUserReport { ApplicationUser = applicationUser });
            }

            //highestchildrenofTo
            // report.HighestChildDepartmentsOfTo.Clear();
            // await reportRepository.AddHighestChildDepartmentsOfTo(report, reportResource);

            //file
            //todo

            //add report into database
            reportRepository.AddReport(report);

            //Update applicationUserReport of  main Report to Unred
            if (reportResource.IsReply == true)
            {

                var mainReport = await reportRepository.GetReport(reportResource.MainReportId, true);

                foreach (var email in reportResource.ToEmails)
                {
                    var checkFromEmailExistedInTo = mainReport.To.Any(t => t.ApplicationUser.Email == email);
                    if (checkFromEmailExistedInTo == false)
                    {
                        var applicationUser = await applicationUserRepository.GetApplicationUserByEmail(email, false);
                        mainReport.To.Add(new ApplicationUserReport { ApplicationUser = applicationUser, IsRead = true });
                    }
                }

                foreach (var applicationUserReport in mainReport.To)
                {
                    if (applicationUserReport.ApplicationUser.Email.Equals(reportResource.FromEmail))
                    {
                        applicationUserReport.IsRead = true;
                    }
                    else
                    {
                        applicationUserReport.IsRead = false;
                    }
                }
            }

            await unitOfWork.Complete();

            //get report for converting to json result
            report = await reportRepository.GetReport(report.ReportId, true);

            foreach (var user in report.To)
            {
                //send for receiver
                await hubContext.Clients.All.SendAsync(user.ApplicationUser.Email + "_NewReport", report.ReportId, report.Title);
            }

            //send for sender to reload data
            await hubContext.Clients.All.SendAsync(report.From.Email);

            var result = mapper.Map<Report, ReportResource>(report);

            return Ok(result);
        }

        // PUT: api/reports/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> Updatereport(long id, [FromBody]ReportResource reportResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            var report = await reportRepository.GetReport(id, true);

            //check if report with the id dont exist in the database
            if (report == null)
            {
                return NotFound();
            }

            //map reportResource json into report model
            mapper.Map<ReportResource, Report>(reportResource, report);

            //add department for report
            report.Department = await departmentRepository.GetDepartment(reportResource.DepartmentId, false);

            //add project for report
            report.Project = await projectRepository.GetProject(reportResource.ProjectId, false);

            //add from applicationUser
            report.From = await applicationUserRepository.GetApplicationUser(reportResource.FromId, false);

            //add main report if is reply
            if (reportResource.MainReportId != null)
            {
                report.MainReport = await reportRepository.GetReport(reportResource.MainReportId, false);
            }

            //add To applicationUser
            report.To.Clear();
            foreach (var email in reportResource.ToEmails)
            {
                // var applicationUserReport = await applicationUserReportRepository.GetApplicationUserReport(applicationUserReportId, false);
                // report.To.Add(applicationUserReport);
                var applicationUser = await applicationUserRepository.GetApplicationUserByEmail(email, false);
                report.To.Add(new ApplicationUserReport { ApplicationUser = applicationUser });
            }

            // //add Read ApplicationUser
            // report.Read.Clear();
            // foreach (var applicationUserId in reportResource.Read)
            // {
            //     var applicationUser = await applicationUserRepository.GetApplicationUser(applicationUserId, false);
            //     report.Read.Add(applicationUser);
            // }

            //highestchildrenofTo
            //Todo

            //file
            //todo

            await unitOfWork.Complete();

            // converting report object to json result
            var result = mapper.Map<Report, ReportResource>(report);
            return Ok(result);
        }

        // DELETE: api/reports/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> Deletereport(long id)
        {
            var report = await reportRepository.GetReport(id, includeRelated: false);

            //check if report with the id dont exist in the database
            if (report == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of report into true
            reportRepository.RemoveReport(report);

            await unitOfWork.Complete();

            return Ok(id);
        }
    }
}
