using Data.IRepositories;

namespace Data.Repositories
{
    public class SellerRepository : GeneraicRepository<Merchant>, ISellerRepository
    {
        public SellerRepository(DatabaseContext context, ISessionService sessionService) : base(context, sessionService)
        {

        }
    }
}
