using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace ReportSystemWebApplication.Extensions
{
    public static class IQueryableExtensions
    {
        public static IQueryable<T> ApplyOrdering<T>(this IQueryable<T> query,
           IQueryObject queryObj, Dictionary<string, Expression<Func<T, object>>> columnsMap)
        {
            if (String.IsNullOrWhiteSpace(queryObj.SortBy) || !columnsMap.ContainsKey(queryObj.SortBy))
            {
                return query;
            }

            if (queryObj.IsSortAscending)
            {
                return query.OrderBy(columnsMap[queryObj.SortBy]);
            }
            else
            {
                return query.OrderByDescending(columnsMap[queryObj.SortBy]);
            }
        }

        public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, IQueryObject queryObj)
        {
            if (queryObj.Page == null || queryObj.Page == 0)
            {
                if (queryObj.PageSize <= 0)
                {
                    return query;
                }
                else
                {
                    return query.Take(queryObj.PageSize);
                }

            }
            else
            {
                if (queryObj.Page < 0)
                {
                    queryObj.Page = 1;
                }

                if (queryObj.PageSize <= 0)
                {
                    queryObj.PageSize = 5;
                }
                return query.Skip((queryObj.Page.Value - 1) * queryObj.PageSize).Take(queryObj.PageSize);
            }
        }

    }
}
