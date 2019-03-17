using MailKit.Net.Smtp;
using MimeKit;
using System;

namespace ReportSystemWebApplication.Extensions
{
    public class SendMail
    {
        public static void SendMailConfirmation(string FromAdressTitle, string FromAddress, string Password, string ToAdressTitle,
        string ToAddress, string Subject, string BodyContent, string SmtpServer, int SmtpPortNumber)
        {
            try
            {
                var mimeMessage = new MimeMessage();
                mimeMessage.From.Add(new MailboxAddress(FromAdressTitle, FromAddress));
                mimeMessage.To.Add(new MailboxAddress(ToAdressTitle, ToAddress));
                mimeMessage.Subject = Subject;

                var builder = new BodyBuilder();
                builder.TextBody = BodyContent;

                // Now we just need to set the message body 
                mimeMessage.Body = builder.ToMessageBody();

                using (var client = new SmtpClient())
                {

                    client.Connect(SmtpServer, SmtpPortNumber, false);
                    // Note: only needed if the SMTP server requires authentication  
                    // Error 5.5.1 Authentication   
                    client.Authenticate(FromAddress, Password);
                    client.Send(mimeMessage);
                    client.Disconnect(true);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
}
