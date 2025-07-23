using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.DTOs
{
    public class CarsModelDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        List<PartDTO> Parts { get; set; }
        List<ModelTypeDTO> ModelTypes { get; set; }
    }
}
