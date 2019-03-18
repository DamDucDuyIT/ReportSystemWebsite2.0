using System.ComponentModel.DataAnnotations;

namespace ReportSystemWebApplication.Models.AccountViewModels
{
    public class RegisterViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }
        //[Required]

        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public long? DepartmentId { get; set; }
        public string ConfirmationCode { get; set; }
    }
}
