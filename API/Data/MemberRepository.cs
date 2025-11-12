using System;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MemberRepository(AppDbContext context) : IMemberRepository
{
    public async Task<Member?> GetMemberByIdAsync(string id)
    {

        return await context.Members.FindAsync(id);
    }

    public async Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams)
  
    {
        var query = context.Members.AsQueryable();

        query = query.Where(x => x.Id != memberParams.CurrentMemberId);

        if (memberParams.Gender != null)
        {
            query = query.Where(x=> x.Gender ==memberParams.Gender);
        }

        var minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MaxAge-1));

        var maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MinAge));

        query = query.Where(x => x.DateOfBirth >= minDob &&  x.DateOfBirth<=maxDob);

        query = memberParams.OrderBy switch
        {
            "created" => query.OrderByDescending(x => x.Created),
            _ => query.OrderByDescending(x=>x.LastActive)
        };
        
        
        return await PaginationHelper.CreatesAsync(query,

             memberParams.PageNumber, memberParams.PageSize);
    }

    public async Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId)
    {

        return await context.Members
        .Where(x => x.Id == memberId)
        .SelectMany(x => x.Photos)
        .Where(x => x.isApproved == true)
        .ToListAsync();
    }
    
    public async Task<IReadOnlyList<Photo>> GetPhotosForMyselfAsync(string memberId)
    {
        
        return await context.Members
        .Where(x => x.Id == memberId)
        .SelectMany(x => x.Photos)
        .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Update(Member member)
    {
        context.Entry(member).State = EntityState.Modified;
    }

    public async Task<Member?> GetMemberForUpdate(string id)
    {
        return await context.Members
                        .Include(x => x.User)
                        .Include(x => x.Photos)
                        .SingleOrDefaultAsync(x => x.Id == id);
    }

    public async Task<IReadOnlyList<Photo>> GetPhotosForMod()
    {
        return await context.Photos.Where(x => x.isApproved == false).ToListAsync();
    }


    public async Task<string> DeletePhoto(int photo_id)
    {
        var photo = await context.Photos.SingleOrDefaultAsync<Photo>(x => x.Id == photo_id);
        if (photo == null) return "0";
        var publicId = photo.PublicId;
        
        if (await context.Photos.Where(x => x.Id == photo_id).ExecuteDeleteAsync() > 0) return publicId ?? "1";
       


        else return "2";

    }
    
    public async Task<bool> ApprovePhoto(int photo_id)
    {
        var photo = await context.Photos.SingleOrDefaultAsync<Photo>(x => x.Id == photo_id);

        if (photo == null) return false;

        photo.isApproved = true;

        var memberId = photo.MemberId;
        var member = await context.Members.Include(x=>x.User).FirstOrDefaultAsync(x => x.Id == memberId);
        if (member == null) return true;

        if (member.ImageUrl ==null || member.ImageUrl=="")

        {
            member.ImageUrl = photo.Url;
            member.User.ImageUrl= photo.Url;
        }
        
        return true;

    }


}
