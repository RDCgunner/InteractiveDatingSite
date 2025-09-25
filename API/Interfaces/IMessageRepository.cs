using System;
using API.DTO;
using API.Entities;
using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces;

public interface IMessageRepository
{
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    Task<Message?> GetMessage(string messageId);
    Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams);

    Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMember, string recipientId);
    Task<bool> SaveAllAsync();

}
