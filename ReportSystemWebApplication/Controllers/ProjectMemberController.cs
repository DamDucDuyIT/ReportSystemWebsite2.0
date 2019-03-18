using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/projectmembers")]
    public class ProjectMemberController : Controller
    {
        private IProjectMemberRepository projectMemberRepository;
        private IMapper mapper;
        private IUnitOfWork unitOfWork;
        private IProjectRepository projectRepository;

        public ProjectMemberController(IProjectMemberRepository projectMemberRepository, IMapper mapper,
            IUnitOfWork unitOfWork, IProjectRepository projectRepository)
        {
            this.projectMemberRepository = projectMemberRepository;
            this.mapper = mapper;
            this.unitOfWork = unitOfWork;
            this.projectRepository = projectRepository;
        }

        // GET: api/projectmembers/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<ProjectMemberResource>> GetProjectMembers(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the project member with filter and sorting form of the query
            var queryResult = await projectMemberRepository.GetProjectMembers(query);

            //convert all of ProjectMember into ProjectMemberResource json
            return mapper.Map<QueryResult<ProjectMember>, QueryResultResource<ProjectMemberResource>>(queryResult);
        }

        // GET: api/projectmembers/getProjectMember/5
        [HttpGet]
        [Route("getprojectmember/{id}")]
        public async Task<IActionResult> GetProjectMember(int id)
        {
            //get ProjectMember for converting to json result
            var projectMember = await projectMemberRepository.GetProjectMember(id);

            //check if ProjectMember with the id dont exist in the database
            if (projectMember == null)
            {
                return NotFound();
            }

            // converting Department object to json result
            var projectMemberResource = mapper.Map<ProjectMember, ProjectMemberResource>(projectMember);

            return Ok(projectMemberResource);
        }

        // POST: api/ProjectMembers/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateProjectMember([FromBody] ProjectMemberResource projectMemberResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //map ProjectMemberResource json into ProjectMember model
            var projectMember = mapper.Map<ProjectMemberResource, ProjectMember>(projectMemberResource);

            //add project for ProjectMember
            projectMember.Project = await projectRepository.GetProject(projectMemberResource.ProjectId, false);

            //add ProjectMember into database
            projectMemberRepository.AddProjectMember(projectMember);
            await unitOfWork.Complete();

            //get ProjectMember for converting to json result
            projectMember = await projectMemberRepository.GetProjectMember(projectMember.ProjectMemberId, true);

            var result = mapper.Map<ProjectMember, ProjectMemberResource>(projectMember);

            return Ok(result);
        }

        // PUT: api/projectmembers/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> UpdateProjectMember(long id, [FromBody]ProjectMemberResource projectMemberResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var projectMember = await projectMemberRepository.GetProjectMember(id, true);

            //check if ProjectMember with the id dont exist in the database
            if (projectMember == null)
            {
                return NotFound();
            }

            //map DepartmentResource json into Department model
            mapper.Map<ProjectMemberResource, ProjectMember>(projectMemberResource, projectMember);

            await unitOfWork.Complete();

            // converting ProjectMember object to json result
            var result = mapper.Map<ProjectMember, ProjectMemberResource>(projectMember);
            return Ok(result);
        }

        // DELETE: api/projectmembers/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteProjectMember(long id)
        {
            var projectMember = await projectMemberRepository.GetProjectMember(id, includeRelated: false);

            //check if ProjectMember with the id dont exist in the database
            if (projectMember == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of ProjectMember into true
            projectMemberRepository.RemoveProjectMember(projectMember);

            await unitOfWork.Complete();

            return Ok(id);
        }
    }
}