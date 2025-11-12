using System;
using API.Helpers;

namespace API.Entities;

public interface IMemberRepository
{
    void Update(Member member);

    

    Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams);
    

    Task<Member?> GetMemberByIdAsync(String id);

    Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(String memberId);

    Task<Member?> GetMemberForUpdate(string id);

    Task<IReadOnlyList<Photo>> GetPhotosForMod();

    Task<string> DeletePhoto(int photoId);

    Task<bool> ApprovePhoto(int photoId);
    Task<IReadOnlyList<Photo>>GetPhotosForMyselfAsync(string id);
}
