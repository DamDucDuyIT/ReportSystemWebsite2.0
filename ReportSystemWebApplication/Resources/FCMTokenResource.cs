using System.Collections.Generic;

namespace ReportSystemWebApplication.Resources
{
    public class FCMTokenResource
    {
        public long FCMTokenId { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public bool IsDeleted { get; set; }
    }
}