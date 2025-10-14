using System;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IMessageRepository messageRepository,
IMemberRepository memberRepository) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = await memberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);
        Console.WriteLine("am trecut de 1");
        if (sender == null || recipient == null || sender.Id == recipient.Id) return BadRequest("Cannot send this message");
        var message = new Message
        {
            Content = createMessageDto.Content,
            SenderId = sender.Id,
            RecipientId = recipient.Id
        };
        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync()) return message.ToDto();

        return BadRequest("Failed to send message");

    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer([FromQuery] MessageParams messageParams)
    {
        messageParams.MemberId = User.GetMemberId();
        return await messageRepository.GetMessagesForMember(messageParams);
    }

    [HttpGet("thread/{recipientId}")]

    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        var currentMember = User.GetMemberId();
        var messages = await messageRepository.GetMessageThread(currentMember, recipientId);
        return Ok(messages);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var memberId = User.GetMemberId();
        var message = await messageRepository.GetMessage(id);

        if (message == null) return BadRequest("Cannot delete this message");
        if (message.SenderId != memberId && message.RecipientId != memberId) return BadRequest("Message cannot be deleted by user");
        if (message.SenderId == memberId) message.SenderDeleted = true;
        else if (message.RecipientId == memberId) message.RecipientDeleted = true;


        if (message is { SenderDeleted: true, RecipientDeleted: true }) messageRepository.DeleteMessage(message);

        if (await messageRepository.SaveAllAsync()) return Ok();
        else return BadRequest("Something went wrong deleting the message");
    }
}
