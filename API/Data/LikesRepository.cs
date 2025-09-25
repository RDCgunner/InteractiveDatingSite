using System;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LikesRepository(AppDbContext context) : ILikesRepository
{
    public void AddLike(MemberLike like)

    {

        context.Likes.Add(like);

    }

    public void DeleteLike(MemberLike like)


    {
        context.Likes.Remove(like);

    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId)
    {
        return await context.Likes.Where(x => x.SourceMemberId == memberId).Select(x => x.TargetMemberId).ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes.FirstOrDefaultAsync(x => x.SourceMemberId == sourceMemberId && x.TargetMemberId == targetMemberId);
    }

    public async Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId)
    {
        var query = context.Likes.AsQueryable();

        switch (predicate)
        {
            case ("liked"):
                return await query.Where(x => x.SourceMemberId == memberId).Select(x => x.TargetMember).ToListAsync();
            case ("likedBy"):
                return await query.Where(x => x.TargetMemberId == memberId).Select(x => x.SourceMember).ToListAsync();
            default: //mutual
                var likedIds = await GetCurrentMemberLikeIds(memberId);
                return await query.Where(x => x.TargetMemberId == memberId && likedIds.Contains(x.SourceMemberId)).Select(x => x.SourceMember).ToListAsync();  
        }
    }

    public async Task<PaginatedResult<Member>> GetMemberLikes2(string predicate, string memberId, MemberParams memberParams)
    {
        var query = context.Likes.AsQueryable();
        
        switch (predicate)
        {
            case ("liked"):
                return await PaginationHelper.CreatesAsync(query.Where(x => x.SourceMemberId == memberId).Select(x => x.TargetMember),memberParams.PageNumber, memberParams.PageSize);
            case ("likedBy"):
                return await PaginationHelper.CreatesAsync(query.Where(x => x.TargetMemberId == memberId).Select(x => x.SourceMember),memberParams.PageNumber, memberParams.PageSize);
            default: //mutual
                var likedIds = await GetCurrentMemberLikeIds(memberId);
                return await PaginationHelper.CreatesAsync(query.Where(x => x.TargetMemberId == memberId && likedIds.Contains(x.SourceMemberId)).Select(x => x.SourceMember),memberParams.PageNumber, memberParams.PageSize);
        }
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
    
    
}
