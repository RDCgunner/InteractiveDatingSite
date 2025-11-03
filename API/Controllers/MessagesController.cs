using System;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IUnitOfWork uow) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = await uow.MemberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await uow.MemberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);
        Console.WriteLine("am trecut de 1");
        if (sender == null || recipient == null || sender.Id == recipient.Id) return BadRequest("Cannot send this message");
        var message = new Message
        {
            Content = createMessageDto.Content,
            SenderId = sender.Id,
            RecipientId = recipient.Id
        };
        uow.MessageRepository.AddMessage(message);

        if (await uow.Complete()) return message.ToDto();

        return BadRequest("Failed to send message");

    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer([FromQuery] MessageParams messageParams)
    {
        messageParams.MemberId = User.GetMemberId();
        return await uow.MessageRepository.GetMessagesForMember(messageParams);
    }

    [HttpGet("thread/{recipientId}")]

    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        var currentMember = User.GetMemberId();
        var messages = await uow.MessageRepository.GetMessageThread(currentMember, recipientId);
        return Ok(messages);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var memberId = User.GetMemberId();
        var message = await uow.MessageRepository.GetMessage(id);

        if (message == null) return BadRequest("Cannot delete this message");
        if (message.SenderId != memberId && message.RecipientId != memberId) return BadRequest("Message cannot be deleted by user");
        if (message.SenderId == memberId) message.SenderDeleted = true;
        else if (message.RecipientId == memberId) message.RecipientDeleted = true;


        if (message is { SenderDeleted: true, RecipientDeleted: true }) uow.MessageRepository.DeleteMessage(message);

        if (await uow.Complete()) return Ok();
        else return BadRequest("Something went wrong deleting the message");
    }
}
