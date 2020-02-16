using System;
using System.IO;
using System.Text;
using Microsoft.Extensions.Logging;
using Aliyun.Serverless.Core;

 namespace example
 {
    public class App
    {
        public static string StreamToString(Stream stream)
        {
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }

        public Stream HandleRequest(Stream input, IFcContext context)
        {
            ILogger logger = context.Logger;
            logger.LogInformation(String.Format("Event {0} ", StreamToString(input)));
            logger.LogInformation(String.Format("Context {0} ", Newtonsoft.Json.JsonConvert.SerializeObject(context)));
            logger.LogInformation(String.Format("Handle request {0} ", context.RequestId));

            byte[] data = Encoding.UTF8.GetBytes("Hello World!");
            MemoryStream output = new MemoryStream();
            output.Write(data, 0, data.Length);
            output.Flush();
            return output;
        }
    }
 }
