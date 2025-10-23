using System;

namespace API.Entities;

public class Connection(string connectionId, string userId)
{
    public string ConnectionId { get; set; } = connectionId;
    public string userId { get; set; } = userId;

    //nav prop
    public Group Group { get; set; } = null!;
}
