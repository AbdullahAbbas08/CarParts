using Data.IRepositories;
using Data.Models;

namespace Data.Repositories
{
    public class SellerCategoryRepository : GeneraicRepository<SellerCategory>, ISellerCategoryRepository
    {
        public SellerCategoryRepository(DatabaseContext context, ISessionService sessionService) : base(context, sessionService)
        {

        }
    }
}
