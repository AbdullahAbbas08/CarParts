using Data.IRepositories;

namespace Data.Repositories
{
    public class SellerRepository : GeneraicRepository<Seller>, ISellerRepository
    {
        public SellerRepository(DatabaseContext context, ISessionService sessionService) : base(context, sessionService)
        {

        }
    }
}
