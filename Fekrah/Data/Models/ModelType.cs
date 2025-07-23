using Data.ModelInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class ModelType : IAuditableInsert, IAuditableUpdate
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public int CarsModelId { get; set; }
        [ForeignKey(nameof(CarsModelId))]
        public CarsModel CarsModel { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }
    }
}
