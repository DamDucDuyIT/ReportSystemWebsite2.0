using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using ReportSystemWebApplication.Models.FCMModels;

namespace ReportSystemWebApplication.Extensions
{
    public class SendMessageToFirebase
    {
        public async static Task<string> Send(string email, string title, long reportId, string token)
        {
            var messageInformation = new Message()
            {
                notification = new Notification()

                {
                    title = email,
                    text = title
                },

                data = new ReportSystemWebApplication.Models.FCMModels.Data { ReportId = reportId },
                to = token
            };
            string jsonMessage = JsonConvert.SerializeObject(messageInformation);

            // Create request to Firebase API

            var request = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");

            request.Headers.TryAddWithoutValidation("Authorization", "key=AAAA32J08cI:APA91bFJkYbb2uRCE8KO2ewN-LhWjIR4LTCM5grnR1h3dOmtcOjWSoqL1_CrBKyI3XC5OR2-Iya4AP-8INp3qMvkuN0e6Az8r6u-xmsJ0oxPijUKUU9_w_J5UNH8uddTb2o-kPTtfoRM");

            request.Content = new StringContent(jsonMessage, Encoding.UTF8, "application/json");

            HttpResponseMessage result;
            string apiResponse = "";
            using (var client = new HttpClient())
            {
                result = await client.SendAsync(request);
                apiResponse = result.Content.ReadAsStringAsync().Result;
            }

            return apiResponse;
        }
    }
}