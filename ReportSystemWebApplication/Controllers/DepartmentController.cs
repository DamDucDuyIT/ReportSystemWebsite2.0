using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.SubModels;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using ReportSystemWebApplication.Resources.SubResources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/departments")]
    public class DepartmentController : Controller
    {
        private IDepartmentRepository departmentRepository;
        private IMapper mapper;
        private IUnitOfWork unitOfWork;

        public DepartmentController(IDepartmentRepository departmentRepository, IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            this.departmentRepository = departmentRepository;
            this.mapper = mapper;
            this.unitOfWork = unitOfWork;
        }

        // GET: api/departments/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<DepartmentResource>> GetDepartments(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Departments with filter and sorting form of the query
            var queryResult = await departmentRepository.GetDepartments(query);

            //convert all of Departments into DepartmentResource json
            return mapper.Map<QueryResult<Department>, QueryResultResource<DepartmentResource>>(queryResult);
        }

        // GET: api/departments/getchilddepartmentofuser
        [HttpGet]
        [Route("getchilddepartmentofuser")]
        public async Task<QueryResultResource<ChildDepartmentOfUserResource>> GetChildDepartmentsOfUserWithEmail(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Departments with filter and sorting form of the query
            var queryResult = await departmentRepository.GetChildDepartmentsOfUserWithEmail(query);

            //convert all of Departments into DepartmentResource json
            return mapper.Map<QueryResult<ChildDepartmentOfUser>, QueryResultResource<ChildDepartmentOfUserResource>>(queryResult);
        }

        // GET: api/departments/getdepartmentsbytreegraph
        [HttpGet]
        [Route("getdepartmentsbytreegraph")]
        public async Task<IActionResult> GetDepartmentsByTreeGraph(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Departments with filter and sorting form of the query
            var queryResult = await departmentRepository.GetDepartmentsByTreeGraph(query);

            var result = mapper.Map<List<DepartmentGraph>, List<DepartmentGraphResource>>(queryResult);

            return Ok(result);
        }

        // GET: api/departments/getdepartment/5
        [HttpGet]
        [Route("getdepartment/{id}")]
        public async Task<IActionResult> GetDepartment(long id)
        {
            //get Department for converting to json result
            var department = await departmentRepository.GetDepartment(id);

            //check if Department with the id dont exist in the database
            if (department == null)
            {
                return NotFound();
            }

            // converting Department object to json result
            var departmentResource = mapper.Map<Department, DepartmentResource>(department);

            return Ok(departmentResource);
        }

        // POST: api/departments/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentResource departmentResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Check code is existed
            var codeExisted = await departmentRepository.GetDepartmentByCode(departmentResource.Code, false);
            if (codeExisted != null)
            {
                return BadRequest("Code has been generated");
            }

            //map DepartmentResource json into Department model
            var department = mapper.Map<DepartmentResource, Department>(departmentResource);

            if (departmentResource.ParentId != null)
            {
                //add parent for Department
                department.Parent = await departmentRepository.GetDepartment(departmentResource.ParentId, false);

                //add level for Department
                department.Level = department.Parent.Level + 1;
            }
            else
            {
                //Root Department dont have parent
                department.Parent = null;

                //add level for Root Department
                department.Level = 1;
            }


            //add Department into database
            departmentRepository.AddDepartment(department);
            await unitOfWork.Complete();

            //get Department for converting to json result
            department = await departmentRepository.GetDepartment(department.DepartmentId, true);

            var result = mapper.Map<Department, DepartmentResource>(department);

            return Ok(result);
        }

        // PUT: api/departments/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> UpdateDepartment(long id, [FromBody]DepartmentResource departmentResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var department = await departmentRepository.GetDepartment(id, true);

            //check if Department with the id dont exist in the database
            if (department == null)
            {
                return NotFound();
            }

            //Check code is existed
            var codeExisted = await departmentRepository.GetDepartmentByCode(departmentResource.Code, false);
            if (codeExisted != null && codeExisted.DepartmentId != department.DepartmentId)
            {
                return BadRequest("Code has been generated");
            }

            //map DepartmentResource json into Department model
            mapper.Map<DepartmentResource, Department>(departmentResource, department);

            if (departmentResource.ParentId != null)
            {
                //update parent for Department
                department.Parent = await departmentRepository.GetDepartment(departmentResource.ParentId, false);

                //update level for Department
                department.Level = department.Parent.Level + 1;
            }
            else
            {
                //Root Department dont have parent
                department.Parent = null;

                //update level for Root Department
                department.Level = 1;
            }

            await unitOfWork.Complete();

            // converting Department object to json result
            var result = mapper.Map<Department, DepartmentResource>(department);
            return Ok(result);
        }

        // DELETE: api/departments/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteDepartment(long id)
        {
            var department = await departmentRepository.GetDepartment(id, includeRelated: false);

            //check if Department with the id dont exist in the database
            if (department == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of Department into true
            departmentRepository.RemoveDepartment(department);

            await unitOfWork.Complete();

            return Ok(id);
        }
    }
}
