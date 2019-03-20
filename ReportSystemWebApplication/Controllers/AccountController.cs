using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ReportSystemWebApplication.Extensions;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Models.AccountViewModels;
using ReportSystemWebApplication.Persistences.IRepositories;
using ReportSystemWebApplication.Resources;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Controllers
{
    [Route("api/accounts")]
    public class AccountController : Controller
    {
        private UserManager<ApplicationUser> userManager;
        private SignInManager<ApplicationUser> signInManager;
        private IConfiguration config;
        private IApplicationUserRepository applicationUserRepository;
        private IMapper mapper;
        private IDepartmentRepository departmentRepository;
        private IUnitOfWork unitOfWork;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config, IApplicationUserRepository applicationUserRepository,
            IMapper mapper, IDepartmentRepository departmentRepository, IUnitOfWork unitOfWork)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.config = config;
            this.applicationUserRepository = applicationUserRepository;
            this.mapper = mapper;
            this.departmentRepository = departmentRepository;
            this.unitOfWork = unitOfWork;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("generateconfirmationcode")]
        public async Task<IActionResult> GenerateConfirmationCode([FromBody]RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser userCreated;

                var userInDatabase = await applicationUserRepository.GetApplicationUserByEmail(model.Email);
                if (userInDatabase != null)
                {
                    userCreated = await userManager.FindByEmailAsync(model.Email);
                    if (userCreated.IsActived == true)
                    {
                        return BadRequest("Email đã tồn tại!");
                    }
                }
                else
                {
                    var user = new ApplicationUser { UserName = model.Email, Email = model.Email, IsActived = false };
                    var result = await userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        return BadRequest("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng kiểm tra lại dữ liệu.");
                    }

                    userCreated = await userManager.FindByEmailAsync(model.Email);
                }

                //generate confirmation code
                var numberToGenerate = "1234567890";
                var confirmationCode = new char[4];
                var random = new Random();

                for (int i = 0; i < confirmationCode.Length; i++)
                {
                    confirmationCode[i] = numberToGenerate[random.Next(numberToGenerate.Length)];
                }

                userCreated.ConfirmationCode = new String(confirmationCode);

                await unitOfWork.Complete();

                //send email
                SendMail.SendMailConfirmation("Report System", config["EmailSettings:Email"],
                    config["EmailSettings:Password"], "Report System", model.Email, "Confirmation code for account of Report System",
                    "Please check your code: " + new String(confirmationCode), config["EmailSettings:Server"], Int32.Parse(config["EmailSettings:Port"]));

                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody]RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var userCreated = await userManager.FindByEmailAsync(model.Email);

                if (!userCreated.ConfirmationCode.Equals(model.ConfirmationCode))
                {
                    return BadRequest("Mã xác nhận không đúng. Vui lòng kiểm tra lại.");
                }

                await userManager.AddPasswordAsync(userCreated, model.Password);

                userCreated.FullName = model.FullName;
                userCreated.PhoneNumber = model.PhoneNumber;
                userCreated.EmailConfirmed = true;
                userCreated.IsActived = true;
                userCreated.Department = await departmentRepository.GetDepartment(model.DepartmentId, false);

                await userManager.AddToRoleAsync(userCreated, "User");

                await unitOfWork.Complete();
                return Ok(userCreated);

            }

            return BadRequest("data which sent to server is not valid.");
        }

        [HttpPost]
        [Route("generatetoken")]
        public async Task<IActionResult> GenerateToken([FromBody] LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await userManager.FindByEmailAsync(model.Email);

                if (user != null && user.IsActived == true)
                {
                    var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                    if (result.Succeeded)
                    {
                        var claims = new Claim[]
                         {
                          new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                          new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                          new Claim(ClaimTypes.Role, userManager.GetRolesAsync(user).Result[0]),
                          new Claim(ClaimTypes.Email, user.Email)
                         };

                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Tokens:Key"]));
                        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                        var expires = DateTime.Now.AddDays(7);
                        var token = new JwtSecurityToken(config["Tokens:Issuer"],
                          config["Tokens:Issuer"],
                          claims,
                          expires: expires,
                          signingCredentials: creds);

                        var userByEmail = await applicationUserRepository.GetApplicationUserByEmail(user.Email, true);
                        return Ok(
                            new
                            {
                                access_token = new JwtSecurityTokenHandler().WriteToken(token),
                                expires = expires.ToString("s"),
                                userName = user.UserName,
                                email = user.Email,
                                role = userManager.GetRolesAsync(user).Result[0],
                                fullName = user.FullName,
                                departmentId = userByEmail.Department.DepartmentId
                            }
                        );
                    }
                }
                else
                {
                    return BadRequest("Có lỗi xảy ra trong quá trình đăng nhập. Gợi ý: Email chưa được đăng ký.");
                }
            }

            return BadRequest("Không thể đăng nhập. Vui lòng kiểm tra lại Email và Mật khẩu.");
        }

        [HttpPut]
        [Route("updatebyemail/{email}")]
        //[AllowAnonymous]
        public async Task<IActionResult> UpdateUserByEmail(string email, [FromBody]ApplicationUserResource applicationUserResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await applicationUserRepository.GetApplicationUserByEmail(email, true);

            //check if user with the id dont exist in the database
            if (user == null)
            {
                return NotFound();
            }

            //update information
            applicationUserRepository.UpdateUserInformation(user, applicationUserResource);

            //add department for user
            if (applicationUserResource.DepartmentId != null)
            {
                user.Department = await departmentRepository.GetDepartment(applicationUserResource.DepartmentId, false);
            }

            await unitOfWork.Complete();

            // converting ApplicationUser object to json result
            var result = mapper.Map<ApplicationUser, ApplicationUserResource>(user);
            return Ok(result);
        }

        [HttpPut]
        [Route("update/{id}")]
        //[AllowAnonymous]
        public async Task<IActionResult> UpdateUser(string id, [FromBody]ApplicationUserResource applicationUserResource)
        {
            //check model is valid?
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await applicationUserRepository.GetApplicationUser(id, true);

            //check if user with the id dont exist in the database
            if (user == null)
            {
                return NotFound();
            }

            //map USerResource json into ApplicationUser model
            mapper.Map<ApplicationUserResource, ApplicationUser>(applicationUserResource, user);

            //add department for user
            user.Department = await departmentRepository.GetDepartment(applicationUserResource.DepartmentId, false);

            await unitOfWork.Complete();

            // converting ApplicationUser object to json result
            var result = mapper.Map<ApplicationUser, ApplicationUserResource>(user);
            return Ok(result);
        }

        // GET: api/accounts/getall
        [HttpGet]
        [Route("getall")]
        public async Task<QueryResultResource<ApplicationUserResource>> GetApplicationUsers(QueryResource queryResource)
        {
            //convert queryresource json into query object
            var query = mapper.Map<QueryResource, Query>(queryResource);

            //get all the fans with filter and sorting form of the query
            var queryResult = await applicationUserRepository.GetApplicationUsers(query);

            //convert all of fans into ApplicationUserResource json
            return mapper.Map<QueryResult<ApplicationUser>, QueryResultResource<ApplicationUserResource>>(queryResult);
        }

        [HttpGet]
        [Route("getaccount/{id}")]
        public async Task<IActionResult> GetAccount(string id)
        {
            //get ApplicationUser for converting to json result
            var applicationUser = await applicationUserRepository.GetApplicationUser(id, true);

            //check if ApplicationUser with the id dont exist in the database
            if (applicationUser == null)
            {
                return NotFound();
            }

            // converting applicationUserResource object to json result
            var applicationUserResource = mapper.Map<ApplicationUser, ApplicationUserResource>(applicationUser);

            return Ok(applicationUserResource);
        }

        [HttpGet]
        [Route("getaccountbyemail/{email}")]
        public async Task<IActionResult> GetAccountByEmail(string email)
        {
            //get ApplicationUser for converting to json result
            var applicationUser = await applicationUserRepository.GetApplicationUserByEmail(email, true);

            //check if ApplicationUser with the id dont exist in the database
            if (applicationUser == null)
            {
                return NotFound();
            }

            // converting applicationUserResource object to json result
            var applicationUserResource = mapper.Map<ApplicationUser, ApplicationUserResource>(applicationUser);

            return Ok(applicationUserResource);
        }


        [HttpDelete]
        [Route("delete/{email}")]
        public async Task<IActionResult> DeleteApplicationUser(string email)
        {
            var user = await applicationUserRepository.GetApplicationUserByEmail(email);

            //check if user with the id dont exist in the database
            if (user == null)
            {
                return NotFound();
            }

            //just change the IsDeleted of user into true
            applicationUserRepository.RemoveApplicationUser(user);
            await unitOfWork.Complete();

            return Ok(email);
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("generateresetpasswordcode/{email}")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null || user.IsActived == false)
            {
                return BadRequest("We can find any account with this email in our database.");
            }

            var code = await userManager.GeneratePasswordResetTokenAsync(user);

            var linkToWebsite = Constant.Url + "resetpassword/" + code;
            var linkInEmail = "<a href='" + linkToWebsite + "'>" + linkToWebsite + "</a>";
            //send email
            SendMail.SendMailConfirmation("Report System", config["EmailSettings:Email"],
                config["EmailSettings:Password"], "Report System", email, "Reset password code for account of Report System",
                "Please reset password by this link: " + linkInEmail, config["EmailSettings:Server"], Int32.Parse(config["EmailSettings:Port"]));

            return Ok(code);
        }

        [HttpPut]
        [AllowAnonymous]
        [Route("resetpassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null || user.IsActived == false)
            {
                return BadRequest("We can find any account with this email in our database.");
            }

            var result = await userManager.ResetPasswordAsync(user, model.Code, model.Password);
            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(" Something wrong. We cannot update your password. Something wrong");
        }

        [HttpPut]
        [AllowAnonymous]
        [Route("resetpasswordforadmin")]
        public async Task<IActionResult> ResetPasswordForAdmin([FromBody] ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null || user.IsActived == false)
            {
                return BadRequest("We can find any account with this email in our database.");
            }

            var code = await userManager.GeneratePasswordResetTokenAsync(user);

            var result = await userManager.ResetPasswordAsync(user, code, model.Password);
            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(" Something wrong. We cannot update your password. Something wrong");
        }

        [HttpPut]
        [AllowAnonymous]
        [Route("resetpasswordforuser")]
        public async Task<IActionResult> ResetPasswordForUser([FromBody] ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null || user.IsActived == false)
            {
                return BadRequest("We can find any account with this email in our database.");
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, model.OldPassword, false);
            if (result.Succeeded)
            {

                var code = await userManager.GeneratePasswordResetTokenAsync(user);

                var resetPassword = await userManager.ResetPasswordAsync(user, code, model.Password);
                if (resetPassword.Succeeded)
                {
                    return Ok();
                }
            }
            else
            {
                return BadRequest("Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại.");
            }

            return BadRequest(" Something wrong. We cannot update your password. Something wrong");
        }
    }
}
