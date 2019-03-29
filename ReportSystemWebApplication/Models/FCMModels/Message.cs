namespace ReportSystemWebApplication.Models.FCMModels
{
    public class Message
    {
        public string to { get; set; }

        public Notification notification { get; set; }

        public Data data { get; set; }
    }

}
