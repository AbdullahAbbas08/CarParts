using Data.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public interface IUnitOfWork
    {
        IGeneraicRepository<TDbEntity> Repository<TDbEntity>() where TDbEntity : class;
        void SaveChanges(); 
    }
}
