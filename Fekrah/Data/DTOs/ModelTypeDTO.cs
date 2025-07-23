using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.DTOs
{
    public class ModelTypeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CarsModelId { get; set; }
        public string CarsModelName { get; set; }
    }
}
