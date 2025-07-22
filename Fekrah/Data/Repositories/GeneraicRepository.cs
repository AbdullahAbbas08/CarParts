using Data.IRepositories;
using System.Reflection;


namespace Data.Repositories
{
    public class GeneraicRepository<TDbEntity> : IGeneraicRepository<TDbEntity>
        where TDbEntity : class
    {
        protected readonly DatabaseContext _context;
        private readonly ISessionService _sessionService;

        public GeneraicRepository(DatabaseContext context, ISessionService sessionService)
        {
            _context = context;
            _sessionService = sessionService;
        }

        public IQueryable<TDbEntity> GetAll()
        {
            return _context.Set<TDbEntity>();
        }

        public TDbEntity GetById(object id)
        {
            if (id is null)
                return null;

            return _context.Set<TDbEntity>().Find(id);
        }

        public TDbEntity Insert(TDbEntity entity)
        {
            SetProperty(entity, "CreatedOn", DateTimeOffset.Now);
            //SetProperty(entity, "CreatedBy", _sessionService.UserId);

            _context.Set<TDbEntity>().Add(entity);
            var inserted = _context.SaveChanges();

            if (inserted <= 0)
                return null;

            return entity;
        }

        public TDbEntity Update(TDbEntity entity)
        {
            SetProperty(entity, "UpdatedOn", DateTimeOffset.Now);
            //SetProperty(entity, "UpdatedBy", _sessionService.UserId);

            _context.Set<TDbEntity>().Update(entity);
            var updated = _context.SaveChanges();

            if (updated <= 0)
                return null;

            return entity;
        }

        public IEnumerable<TDbEntity> UpdateRange(IEnumerable<TDbEntity> entities)
        {

            _context.Set<TDbEntity>().UpdateRange(entities);
            var updated = _context.SaveChanges();

            if (updated <= 0)
                return null;

            return entities;
        }

        public TDbEntity Delete(TDbEntity entity)
        {
            SetProperty(entity, "DeletedOn", DateTimeOffset.Now);
            //SetProperty(entity, "DeletedBy", _sessionService.UserId);

            _context.Set<TDbEntity>().Remove(entity);
            _context.SaveChanges();

            return entity;
        }

        public IEnumerable<TDbEntity> DeleteRange(IEnumerable<TDbEntity> entities)
        {
            _context.Set<TDbEntity>().RemoveRange(entities);
            _context.SaveChanges();

            return entities;
        }

        public bool IsExist(object id)
        {
            bool isExist = false;

            TDbEntity dbEntity = _context.Set<TDbEntity>().Find(id);

            if (dbEntity is not null)
                isExist = true;

            return isExist;
        }

        public int Count() => _context.Set<TDbEntity>().Count();

        private void SetProperty(object obj, string property, object value)
        {
            try
            {
                var prop = obj.GetType().GetProperty(property, BindingFlags.Public | BindingFlags.Instance);
                if (prop != null && prop.CanWrite)
                    prop.SetValue(obj, value, null);
            }
            catch { } //property not exist or inserted value doesn't match the property type!
        }
    }
}
