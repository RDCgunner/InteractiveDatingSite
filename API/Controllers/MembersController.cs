using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // [Route("api/[controller]")] //localhost:5001/api/members
    // [ApiController]
    [Authorize]
    public class MembersController(IMemberRepository memberRepository,
        IPhotoService photoService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> getMembers()
        {
            //var members = await context.Users.ToListAsync();
            //return members;
            return Ok(await memberRepository.GetMembersAsync());


        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> getMember(string id)
        {
            var member = await memberRepository.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            else return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> getMembersPhoto(String id)
        {
            return Ok(await memberRepository.GetPhotosForMemberAsync(id));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            // Console.WriteLine($"UserId: {this.User.FindFirst(ClaimTypes.NameIdentifier).Value}");
            // var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var memberId = User.GetMemberId(); //from Extension class
            // if (memberId == null) return BadRequest("Ooops - no Id found in token");
            var member = await memberRepository.GetMemberForUpdate(memberId);
            if (member == null) return BadRequest("Could not get member from Db");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;

            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

            if (await memberRepository.SaveAllAsync()) return NoContent(); //returns 204 request

            return BadRequest("End of update member reached! No update was performed");
        }


        [HttpPost("add-photo")]
        public async Task<ActionResult<Photo>> AddPhoto([FromForm] IFormFile file)
        {
            var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Cannot update nonexistant member");

            var result = await photoService.UploadPhotoAsync(file);

            if (result.Error != null) return BadRequest("Cloudinary error: " + result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                MemberId = User.GetMemberId()
            };

            if (member.ImageUrl == null)
            {
                member.ImageUrl = photo.Url;
                member.User.ImageUrl = photo.Url;
            }

            member.Photos.Add(photo);

            if (await memberRepository.SaveAllAsync()) return photo;

            return BadRequest("Problem adding photo");

        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Cannot get member from token");

            var photo = member.Photos.SingleOrDefault<Photo>(x => x.Id == photoId);
            if (photo == null) return BadRequest("Photo not found");
            if (member.ImageUrl == photo.Url) return BadRequest("Image already is set as main Image");

            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;

            if (await memberRepository.SaveAllAsync()) return NoContent();
            else return BadRequest("Unable saving changes");

        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> deletePhoto(int photoId)
        {
            var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Cannot get member from token");

            var photo = member.Photos.SingleOrDefault<Photo>(x => x.Id == photoId);
            if (photo == null || photo.Url == member.ImageUrl) return BadRequest("You need to set a new photo as main photo");

            if (photo.PublicId != null)
            {
                var result = await photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
            member.Photos.Remove(photo);
            if (await memberRepository.SaveAllAsync()) return Ok();

            return BadRequest("Cannot make changes in db");
        }
    }
};
