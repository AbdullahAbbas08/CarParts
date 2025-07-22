using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Helpers
{
    public class DataSourceResult<T>
    {
        public IEnumerable<T> Data { get; set; }
        public long Count { get; set; }
        public double AdditionalValue { get; set; }
    }
}
