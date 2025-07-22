using Data.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public class CarsModelRepository : GeneraicRepository<CarsModel>, ICarsModelRepository
    {
        public CarsModelRepository(DatabaseContext databaseContext, ISessionService sessionService) : base(databaseContext, sessionService) 
        {
            
        }
    }
}
