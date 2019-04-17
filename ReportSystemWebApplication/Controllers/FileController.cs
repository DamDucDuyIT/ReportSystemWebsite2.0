using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using System;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/files")]
    public class FileController : Controller
    {
        private IFileRepository fileRepository;
        private IMapper mapper;
        private IUnitOfWork unitOfWork;
        private IHostingEnvironment host;
        private IReportRepository reportRepository;

        public FileController(IFileRepository fileRepository, IMapper mapper,
            IUnitOfWork unitOfWork, IHostingEnvironment host, IReportRepository reportRepository)
        {
            this.fileRepository = fileRepository;
            this.mapper = mapper;
            this.unitOfWork = unitOfWork;
            this.host = host;
            this.reportRepository = reportRepository;
        }

        // GET: api/files/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<FileResource>> GetFiles(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the Departments with filter and sorting form of the query
            var queryResult = await fileRepository.GetFiles(query);

            //convert all of File into FileResource json
            return mapper.Map<QueryResult<File>, QueryResultResource<FileResource>>(queryResult);
        }

        // GET: api/files/getfile/5
        [HttpGet]
        [Route("getfile/{id}")]
        public async Task<IActionResult> GetFile(int id)
        {
            //get file for converting to json result
            var file = await fileRepository.GetFile(id);

            //check if file with the id dont exist in the database
            if (file == null)
            {
                return NotFound();
            }

            // converting Department object to json result
            var fileResource = mapper.Map<File, FileResource>(file);

            return Ok(fileResource);
        }

        // POST: api/files/add
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> CreateFile([FromBody] FileResource fileResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //map FileResource json into File model
            var file = mapper.Map<FileResource, File>(fileResource);

            //add report for file
            file.Report = await reportRepository.GetReport(fileResource.ReportId, false);

            //add File into database
            fileRepository.AddFile(file);
            await unitOfWork.Complete();

            //get File for converting to json result
            file = await fileRepository.GetFile(file.FileId, true);

            var result = mapper.Map<File, FileResource>(file);

            return Ok(result);
        }

        // PUT: api/files/update/5
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IActionResult> UpdateFile(long id, [FromBody]FileResource fileResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var file = await fileRepository.GetFile(id, true);

            //check if File with the id dont exist in the database
            if (file == null)
            {
                return NotFound();
            }

            //map DepartmentResource json into Department model
            mapper.Map<FileResource, File>(fileResource, file);

            await unitOfWork.Complete();

            // converting File object to json result
            var result = mapper.Map<File, FileResource>(file);
            return Ok(result);
        }

        // DELETE: api/files/delete/5
        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteFile(long id)
        {
            var file = await fileRepository.GetFile(id, includeRelated: false);

            //check if file with the id dont exist in the database
            if (file == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of file into true
            fileRepository.RemoveFile(file);

            await unitOfWork.Complete();

            return Ok(id);
        }

        [HttpPost]
        [Route("upload/{id}")]
        public async Task<IActionResult> UploadFile(long id, IFormFile file)
        {
            var fileInDatabase = await fileRepository.GetFile(id, false);

            if (fileInDatabase == null)
            {
                return BadRequest("No Id of uploaded file can be found");
            }

            var uploadFolderPath = System.IO.Path.Combine(host.ContentRootPath, "ClientApp/uploads/file");

            if (!System.IO.Directory.Exists(uploadFolderPath))
            {
                System.IO.Directory.CreateDirectory(uploadFolderPath);
            }
            if (file == null)
            {
                return BadRequest("STOP HACKING OUR WEBSITE. SEND A FILE FOR US TO EXECUTE, PLEASE");
            }

            if (file.Length == 0)
            {
                return BadRequest("DO YOU THINK A EMPTY FILE CAN CRASH OUR WEBSITE");
            }

            //extension
            if (System.IO.Path.GetExtension(file.FileName) == ".xlsx" || System.IO.Path.GetExtension(file.FileName) == ".xls"
            || System.IO.Path.GetExtension(file.FileName) == ".xlt" || System.IO.Path.GetExtension(file.FileName) == ".csv")
            {
                fileInDatabase.Icon = "file-excel";
                fileInDatabase.IconMobile = "file-excel";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".doc" || System.IO.Path.GetExtension(file.FileName) == ".docx")
            {
                fileInDatabase.Icon = "file-word";
                fileInDatabase.IconMobile = "file-word";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".pdf")
            {
                fileInDatabase.Icon = "file-pdf";
                fileInDatabase.IconMobile = "file-pdf";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".ppt" || System.IO.Path.GetExtension(file.FileName) == ".pptx")
            {
                fileInDatabase.Icon = "file-ppt";
                fileInDatabase.IconMobile = "file-powerpoint";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".png" || System.IO.Path.GetExtension(file.FileName) == ".bmp"
                || System.IO.Path.GetExtension(file.FileName) == ".jpeg" || System.IO.Path.GetExtension(file.FileName) == ".jpg")
            {
                fileInDatabase.Icon = "picture";
                fileInDatabase.IconMobile = "file-image";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".rar" || System.IO.Path.GetExtension(file.FileName) == ".zip"
                || System.IO.Path.GetExtension(file.FileName) == ".zip5" || System.IO.Path.GetExtension(file.FileName) == ".7zip")
            {
                fileInDatabase.Icon = "export";
                fileInDatabase.IconMobile = "zip-box";
            }
            else if (System.IO.Path.GetExtension(file.FileName) == ".flv" || System.IO.Path.GetExtension(file.FileName) == ".avi"
              || System.IO.Path.GetExtension(file.FileName) == ".mp4" || System.IO.Path.GetExtension(file.FileName) == ".wmv")
            {
                fileInDatabase.Icon = "video-camera";
                fileInDatabase.IconMobile = "library-video";
            }
            else
            {
                fileInDatabase.Icon = "file";
                fileInDatabase.IconMobile = "file";
            }

            fileInDatabase.FileName = fileInDatabase.FileId + System.IO.Path.GetExtension(file.FileName);

            var filePath = System.IO.Path.Combine(uploadFolderPath, fileInDatabase.FileName);

            //create file
            using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            await unitOfWork.Complete();

            //get file
            fileInDatabase = await fileRepository.GetFile(id, false);

            var result = mapper.Map<File, FileResource>(fileInDatabase);

            return Ok(result);
        }

        [HttpGet]
        [Route("download/{id}")]
        public async Task<IActionResult> DownloadFile(long id)
        {
            var file = await fileRepository.GetFile(id, false);
            if (file == null)
            {
                return BadRequest("No Id of uploaded file can be found");
            }

            var contentType = "application/octet-stream";
            var downloadPath = System.IO.Path.Combine(host.ContentRootPath, "ClientApp/uploads/file/" + file.FileName);

            var memory = new System.IO.MemoryStream();
            using (var stream = new System.IO.FileStream(downloadPath, System.IO.FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;
            return File(memory, contentType, file.Title + System.IO.Path.GetExtension(downloadPath));
        }

        [HttpGet]
        [Route("downloadbybase64/{id}")]
        public async Task<IActionResult> DownloadFileByBase64(long id)
        {
            var file = await fileRepository.GetFile(id, false);
            if (file == null)
            {
                return BadRequest("No Id of uploaded file can be found");
            }

            var downloadPath = System.IO.Path.Combine(host.ContentRootPath, "ClientApp/uploads/file/" + file.FileName);

            byte[] b = System.IO.File.ReadAllBytes(downloadPath);

            return Ok(Convert.ToBase64String(b));
        }

        [HttpGet]
        [Route("getimage/{id}")]
        public async Task<IActionResult> GetImage(long id)
        {
            //get uploaded for converting to json result
            var uploadedFile = await fileRepository.GetFile(id);

            //check if uploaded with the id dont exist in the database
            if (uploadedFile == null)
            {
                return NotFound();
            }

            if (!(System.IO.Path.GetExtension(uploadedFile.FileName) == ".png" || System.IO.Path.GetExtension(uploadedFile.FileName) == ".bmp"
                           || System.IO.Path.GetExtension(uploadedFile.FileName) == ".jpeg" || System.IO.Path.GetExtension(uploadedFile.FileName) == ".jpg"))
            {
                return BadRequest("NOT A IMAGE FILE");
            }


            var uploadFolderPath = System.IO.Path.Combine(host.ContentRootPath, "ClientApp/uploads/file");
            var filePath = System.IO.Path.Combine(uploadFolderPath, uploadedFile.FileName);

            var image = System.IO.File.OpenRead(filePath);
            return File(image, "image/" + System.IO.Path.GetExtension(uploadedFile.FileName).Replace(".", ""));
        }
    }
}
