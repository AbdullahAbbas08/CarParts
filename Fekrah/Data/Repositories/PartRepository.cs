using Data.Interfaces;
using Data.IRepositories;

namespace Data.Repositories
{
    public class PartRepository : GeneraicRepository<Part>, IPartRepository
    {
        public PartRepository(DatabaseContext context, ISessionService sessionService) : base(context, sessionService)
        {

        }
    }
}
