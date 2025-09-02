using System;

namespace API.Entities;

public interface IMemberRepository
{
    void Update(Member member);

    Task<bool> SaveAllAsync();

    Task<IReadOnlyList<Member>> GetMembersAsync();

    Task<Member?> GetMemberByIdAsync(String id);

    Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(String memberId);




}
