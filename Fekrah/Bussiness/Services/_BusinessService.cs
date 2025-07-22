using AutoMapper;
using AutoMapper.QueryableExtensions;
using Bussiness.Helpers;
using Bussiness.Interfaces;
using Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness.Services
{
    public abstract class _BusinessService : _IBusinessService
    {
        protected readonly IUnitOfWork _UnitOfWork;
        protected readonly IMapper _Mapper;


        public _BusinessService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _UnitOfWork = unitOfWork;
            _Mapper = mapper;
        }
    }

    public abstract class _BusinessService<TDbEntity, TDetailsDTO> : _BusinessService, _IBusinessService<TDbEntity, TDetailsDTO>
       where TDbEntity : class
       where TDetailsDTO : class
    {

        public _BusinessService(IUnitOfWork UnitOfWork, IMapper Mapper) : base(UnitOfWork, Mapper)
        {

        }

        public virtual TDetailsDTO Delete(object id)
        {
            var entity = _UnitOfWork.Repository<TDbEntity>().GetById(id);

            if (entity is null)
                return null;

            var deleted = _UnitOfWork.Repository<TDbEntity>().Delete(entity);

            if (deleted is null)
                return null;

            return _Mapper.Map(deleted, typeof(TDbEntity), typeof(TDetailsDTO)) as TDetailsDTO;
        }

        public virtual DataSourceResult<TDetailsDTO> GetAll(int pageSize, int page, string? searchTerm = null)
        {
            IQueryable query = _UnitOfWork.Repository<TDbEntity>().GetAll().AsQueryable();

            if (typeof(TDbEntity) == typeof(TDetailsDTO))
                return new DataSourceResult<TDetailsDTO>
                {
                    Data = query.Cast<TDetailsDTO>(),
                    Count = query.Cast<TDetailsDTO>().Count()
                };

            return new DataSourceResult<TDetailsDTO>
            {
                Data = query.ProjectTo<TDetailsDTO>(_Mapper.ConfigurationProvider).Skip((page - 1) * pageSize).Take(pageSize),
                Count = query.ProjectTo<TDetailsDTO>(_Mapper.ConfigurationProvider).Count()
            };
        }

        public virtual TDetailsDTO GetById(object id)
        {
            var entity = _UnitOfWork.Repository<TDbEntity>().GetById(id);

            if (entity is null)
                return null;

            return _Mapper.Map(entity, typeof(TDbEntity), typeof(TDetailsDTO)) as TDetailsDTO;
        }

        public virtual TDetailsDTO Insert(TDetailsDTO entity)
        {
            var baseEntity = _Mapper.Map(entity, typeof(TDetailsDTO), typeof(TDbEntity)) as TDbEntity;
            var toByInsetred = _UnitOfWork.Repository<TDbEntity>().Insert(baseEntity);

            if (toByInsetred is null)
                return null;

            return _Mapper.Map(toByInsetred, typeof(TDbEntity), typeof(TDetailsDTO)) as TDetailsDTO;

        }

        public virtual TDetailsDTO Update(TDetailsDTO entity)
        {
            var baseEntity = _Mapper.Map(entity, typeof(TDetailsDTO), typeof(TDbEntity)) as TDbEntity;
            var toByUpdated = _UnitOfWork.Repository<TDbEntity>().Update(baseEntity);

            if (toByUpdated is null)
                return null;

            return _Mapper.Map(toByUpdated, typeof(TDbEntity), typeof(TDetailsDTO)) as TDetailsDTO;
        }
    }
}
