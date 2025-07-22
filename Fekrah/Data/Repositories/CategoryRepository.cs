using Data.IRepositories;

namespace Data.Repositories
{
    public class CategoryRepository : GeneraicRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(DatabaseContext context, ISessionService sessionService) : base(context, sessionService)
        {

        }
    }
}
