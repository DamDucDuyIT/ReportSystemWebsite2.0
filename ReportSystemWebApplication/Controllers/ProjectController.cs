using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using ReportSystemWebApplication.Resources.SubResources;
using System;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/projects")]
    public class ProjectController : Controller
    {
        private IProjectRepository projectRepository;
        private IMapper mapper;
        private IUnitOfWork unitOfWork;
        private IDepartmentRepository departmentRepository;

        public ProjectController(IProjectRepository projectRepository, IMapper mapper,
          IUnitOfWork unitOfWork, IDepartmentRepository departmentRepository)
        {
            this.projectRepository = projectRepository;
            this.mapper = mapper;
            this.unitOfWork = unitOfWork;
            this.departmentRepository = departmentRepository;
        }


        // GET: api/projects/getprojectsusercreatedandreceived
        [HttpGet]
        [Route("getprojectsusercreateandreceive")]
        public async Task<QueryResultResource<ProjectResource>> GetProjectsUserCreatedAndReceived(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Projects with filter and sorting form of the query
            var queryResult = await projectRepository.GetProjectsUserCreatedAndReceived(query);

            //convert all of Projects into ProjectResource json
            return mapper.Map<QueryResult<Project>, QueryResultResource<ProjectResource>>(queryResult);
        }

        // GET: api/projects/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<ProjectResource>> GetProjects(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Projects with filter and sorting form of the query
            var queryResult = await projectRepository.GetProjects(query);

            //convert all of Projects into ProjectResource json
            return mapper.Map<QueryResult<Project>, QueryResultResource<ProjectResource>>(queryResult);
        }

        [HttpGet]
        [Route("getallprojectofuser")]
        public async Task<QueryResultResource<ProjectByDepartmentResource>> GetAllProjectOfUserByEmail(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the project with filter and sorting form of the query
            var queryResult = await projectRepository.GetProjectOfUserWithEmail(query);

            //convert all of project into subjectResource json
            return mapper.Map<QueryResult<ProjectByDepartment>, QueryResultResource<ProjectByDepartmentResource>>(queryResult);
        }

        // GET: api/projects/getproject/5
        [HttpGet]
        [Route("getproject/{id}")]
        public async Task<IActionResult> GetProject(long id)
        {
            //get Project for converting to json result
            var project = await projectRepository.GetProject(id);

            //check if Project with the id dont exist in the database
            if (project == null)
            {
                return NotFound();
            }

            // converting Project object to json result
            var ProjectResource = mapper.Map<Project, ProjectResource>(project);

            return Ok(ProjectResource);
        }

        // POST: api/projects/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateProject([FromBody] ProjectResource projectResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Check code is existed
            var codeExisted = await projectRepository.GetProjectByCode(projectResource.Code, false);
            if (codeExisted != null)
            {
                return BadRequest("Code has been generated");
            }

            //map ProjectResource json into Project model
            var project = mapper.Map<ProjectResource, Project>(projectResource);

            //add create on datetime for project
            project.CreateOn = DateTime.Now;

            //add department for project
            project.Department = await departmentRepository.GetDepartment(projectResource.DepartmentId, false);

            //adda member into project
            project.ProjectMembers.Clear();
            foreach (var member in projectResource.ProjectMembers)
            {
                project.ProjectMembers.Add(new ProjectMember
                {
                    Name = member.Name,
                    PhoneNumber = member.PhoneNumber,
                    Email = member.Email,
                    Department = member.Department
                });
            }

            //add Project into database
            projectRepository.AddProject(project);
            await unitOfWork.Complete();

            //get Project for converting to json result
            project = await projectRepository.GetProject(project.ProjectId, true);

            var result = mapper.Map<Project, ProjectResource>(project);

            return Ok(result);
        }

        // PUT: api/projects/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> UpdateProject(long id, [FromBody]ProjectResource projectResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var project = await projectRepository.GetProject(id, true);

            //check if Project with the id dont exist in the database
            if (project == null)
            {
                return NotFound();
            }

            //Check code is existed
            var codeExisted = await projectRepository.GetProjectByCode(projectResource.Code, false);
            if (codeExisted != null && codeExisted.ProjectId != project.ProjectId)
            {
                return BadRequest("Code has been generated");
            }

            //map ProjectResource json into Project model
            mapper.Map<ProjectResource, Project>(projectResource, project);

            //add department for project
            project.Department = await departmentRepository.GetDepartment(projectResource.DepartmentId, false);

            //adda member into project
            project.ProjectMembers.Clear();
            foreach (var member in projectResource.ProjectMembers)
            {
                project.ProjectMembers.Add(new ProjectMember
                {
                    Name = member.Name,
                    PhoneNumber = member.PhoneNumber,
                    Email = member.Email,
                    Department = member.Department
                });
            }

            await unitOfWork.Complete();

            // converting Project object to json result
            var result = mapper.Map<Project, ProjectResource>(project);
            return Ok(result);
        }

        // DELETE: api/projects/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteProject(long id)
        {
            var Project = await projectRepository.GetProject(id, includeRelated: false);

            //check if Project with the id dont exist in the database
            if (Project == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of Project into true
            projectRepository.RemoveProject(Project);

            await unitOfWork.Complete();

            return Ok(id);
        }
    }
}
