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




}
