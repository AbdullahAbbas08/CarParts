using Data.ModelInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Models
{
    public class City : IAuditableInsert, IAuditableUpdate
    {
        public int Id { get; set; }
        public string NameAr { get; set; }

        public int GovernorateId { get; set; }
        [ForeignKey(nameof(GovernorateId))]
        public Governorate Governorate { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }
        public ICollection<Merchant> Merchants { get; set; }

    }
}
