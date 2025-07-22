using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.ViewModels
{
    public class SellerFilterViewModel
    {
        public int? SellerId { get; set; }
        public double? Rating { get; set; }
        public int? CityId { get; set; }
        public bool IsFavoritSeller { get; set; } = false;
        public int? OrderType { get; set; }
        public bool IsDescendingOrder { get; set; } = false;
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
