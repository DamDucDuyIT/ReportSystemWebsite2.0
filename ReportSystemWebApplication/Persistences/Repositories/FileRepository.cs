using Microsoft.EntityFrameworkCore;
using ReportSystemWebApplication.Data;
using ReportSystemWebApplication.Extensions;
using ReportSystemWebApplication.Models;
using ReportSystemWebApplication.Persistences.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ReportSystemWebApplication.Persistences.Repositories
{
    public class FileRepository : IFileRepository
    {
        private ApplicationDbContext context;

        public FileRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public void AddFile(File file)
        {
            context.Files.Add(file);
        }

        public async Task<File> GetFile(long? id, bool includeRelated = true)
        {
            if (!includeRelated)
            {
                return await context.Files.FindAsync(id);
            }
            return await context.Files
                .Include(f => f.Report)
                .SingleOrDefaultAsync(f => f.FileId == id);
        }

        public async Task<QueryResult<File>> GetFiles(Query queryObj)
        {
            var result = new QueryResult<File>();
            var query = context.Files
                    .Where(f => f.IsDeleted == false)
                    .Include(f => f.Report)
                    .AsQueryable();

            //filter
            if (queryObj.ReportId.HasValue)
            {
                query = query.Where(q => q.Report.ReportId == queryObj.ReportId.Value);
            }

            //sort
            var columnsMap = new Dictionary<string, Expression<Func<File, object>>>()
            {
                ["fileName"] = s => s.FileName,
                ["title"] = s => s.Title
            };
            if (queryObj.SortBy != "id" || queryObj.IsSortAscending != true)
            {
                query = query.OrderByDescending(s => s.FileId);
            }
            query = query.ApplyOrdering(queryObj, columnsMap);

            result.TotalItems = await query.CountAsync();

            //paging
            query = query.ApplyPaging(queryObj);

            result.Items = await query.ToListAsync();

            return result;
        }

        public void RemoveFile(File file)
        {
            file.IsDeleted = true;
        }
    }
}
