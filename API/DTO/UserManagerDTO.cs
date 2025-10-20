using System;

namespace API.DTO;

public class UserManagerDTO
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public List<string> Roles { get; set; } = [];
}
