﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class SellerCategory
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public int SellerId { get; set; }
        public Seller Seller { get; set; }
    }
}
