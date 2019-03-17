using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ReportSystemWebApplication.Hubs;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/applicationuserreports")]
    public class ApplicationUserReportController : Controller
    {
        private IApplicationUserReportRepository applicationUserReportRepository;
        private IMapper mapper;
        private IUnitOfWork unitOfWork;
        private IReportRepository reportRepository;
        private IApplicationUserRepository applicationUserRepository;
        private IHubContext<ReportSystemHub> hubContext;

        public ApplicationUserReportController(IApplicationUserReportRepository applicationUserReportRepository, IMapper mapper,
            IUnitOfWork unitOfWork, IReportRepository reportRepository, IApplicationUserRepository applicationUserRepository,
            IHubContext<ReportSystemHub> hubContext)
        {
            this.applicationUserReportRepository = applicationUserReportRepository;
            this.mapper = mapper;
            this.unitOfWork = unitOfWork;
            this.reportRepository = reportRepository;
            this.applicationUserRepository = applicationUserRepository;
            this.hubContext = hubContext;
        }

        // GET: api/applicationuserreports/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<ApplicationUserReportResource>> GetApplicationUserReports(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the ApplicationUserReports with filter and sorting form of the query
            var queryResult = await applicationUserReportRepository.GetApplicationUserReports(query);

            //convert all of ApplicationUserReports into ApplicationUserReportResource json
            return mapper.Map<QueryResult<ApplicationUserReport>, QueryResultResource<ApplicationUserReportResource>>(queryResult);
        }

        // GET: api/applicationuserreports/getapplicationuserreport/5
        [HttpGet]
        [Route("getapplicationuserreport/{id}")]
        public async Task<IActionResult> GetApplicationUserReport(long id)
        {
            //get ApplicationUserReport for converting to json result
            var applicationUserReport = await applicationUserReportRepository.GetApplicationUserReport(id);

            //check if ApplicationUserReport with the id dont exist in the database
            if (applicationUserReport == null)
            {
                return NotFound();
            }

            // converting ApplicationUserReport object to json result
            var applicationUserReportResource = mapper.Map<ApplicationUserReport, ApplicationUserReportResource>(applicationUserReport);

            return Ok(applicationUserReportResource);
        }

        // POST: api/applicationuserreports/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateApplicationUserReport([FromBody] ApplicationUserReportResource applicationUserReportResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //map ApplicationUserReportResource json into ApplicationUserReport model
            var applicationUserReport = mapper.Map<ApplicationUserReportResource, ApplicationUserReport>(applicationUserReportResource);

            //Add report for applicationUserRepoet
            applicationUserReport.Report = await reportRepository.GetReport(applicationUserReportResource.ReportId);

            //Add applicationUser for applicationUserRepoet
            applicationUserReport.ApplicationUser = await applicationUserRepository.GetApplicationUser(applicationUserReportResource.ApplicationUserId);

            //add ApplicationUserReport into database
            applicationUserReportRepository.AddApplicationUserReport(applicationUserReport);
            await unitOfWork.Complete();

            //get ApplicationUserReport for converting to json result
            applicationUserReport = await applicationUserReportRepository.GetApplicationUserReport(applicationUserReport.ApplicationUserReportId, true);

            var result = mapper.Map<ApplicationUserReport, ApplicationUserReportResource>(applicationUserReport);

            return Ok(result);
        }

        // PUT: api/applicationuserreports/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> UpdateApplicationUserReport(long id, [FromBody]ApplicationUserReportResource applicationUserReportResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var applicationUserReport = await applicationUserReportRepository.GetApplicationUserReport(id, true);

            //check if ApplicationUserReport with the id dont exist in the database
            if (applicationUserReport == null)
            {
                return NotFound();
            }

            //map ApplicationUserReportResource json into ApplicationUserReport model
            mapper.Map<ApplicationUserReportResource, ApplicationUserReport>(applicationUserReportResource, applicationUserReport);

            await unitOfWork.Complete();

            // converting ApplicationUserReport object to json result
            var result = mapper.Map<ApplicationUserReport, ApplicationUserReportResource>(applicationUserReport);

            await hubContext.Clients.All.SendAsync(applicationUserReport.ApplicationUser.Email);
            return Ok(result);
        }

        // DELETE: api/applicationuserreports/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteApplicationUserReport(long id)
        {
            var applicationUserReport = await applicationUserReportRepository.GetApplicationUserReport(id, includeRelated: false);

            //check if ApplicationUserReport with the id dont exist in the database
            if (applicationUserReport == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of ApplicationUserReport into true
            applicationUserReportRepository.RemoveApplicationUserReport(applicationUserReport);

            await unitOfWork.Complete();

            return Ok(id);
        }
    }
}
