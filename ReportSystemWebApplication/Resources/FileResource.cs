﻿namespace ReportSystemWebApplication.Resources
{
    public class FileResource
    {
        public long FileId { get; set; }
        public bool IsDeleted { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        public string Icon { get; set; }
        public string IconMobile { get; set; }
        public long? ReportId { get; set; }
    }
}
