using Data.IRepositories;
using Data.Repositories;

namespace Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DatabaseContext _context;
        private readonly ISessionService _sessionService;
        private Dictionary<string, object> repositories;

        public UnitOfWork(DatabaseContext context, ISessionService sessionService)
        {
            _context = context;
            _sessionService = sessionService;
            repositories = new Dictionary<string, object>();
        }

        public void Dispose()
        {
            _context.Dispose();
        }


        public IGeneraicRepository<TDbEntity> Repository<TDbEntity>() where TDbEntity : class
        {
            if (repositories == null)
            {
                repositories = new Dictionary<string, object>();
            }

            var typeToInstantiate = typeof(GeneraicRepository<TDbEntity>).Assembly.GetExportedTypes()
            .FirstOrDefault(t => t.BaseType == typeof(GeneraicRepository<TDbEntity>)) ?? typeof(GeneraicRepository<TDbEntity>);

            var type = typeof(TDbEntity).Name;

            if (!repositories.ContainsKey(type))
            {
                var repositoryInstance = Activator.CreateInstance(typeToInstantiate, this._context, this._sessionService);
                repositories.Add(type, repositoryInstance);
            }
            return (IGeneraicRepository<TDbEntity>)repositories[type];
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }
    }

}
