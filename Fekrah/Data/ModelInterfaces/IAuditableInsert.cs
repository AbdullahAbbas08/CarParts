using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.ModelInterfaces
{
    public interface IAuditableInsert
    {
        int? CreatedByUserId { get; set; }
        DateTimeOffset? CreatedOn { get; set; }
    }
}
