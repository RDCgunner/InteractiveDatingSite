using System;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTO;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Extensions;
namespace API.Controllers;

public class AccountController(AppDbContext context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")] // /api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        if (await checkMailDuplication(dto.Email)) return BadRequest("Email is already in use");
        // if ( checkEmail2(dto.Email)) return BadRequest("Email is already in use");
        using var hmac = new HMACSHA512();

        var appuser = new AppUser
        {
            DisplayName = dto.DisplayName,
            Email = dto.Email,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            PasswordSalt = hmac.Key
        };

        context.Users.Add(appuser);
        await context.SaveChangesAsync();

        return appuser.toDto(tokenService);
    }
    private async Task<bool> checkMailDuplication(string email)
    {
        return await context.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await context.Users.SingleOrDefaultAsync(x => x.Email == dto.Email);
        if (user == null) return Unauthorized("Invalid Credentials");

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
        if (computedHash.SequenceEqual(user.PasswordHash))
            return user.toDto(tokenService); //use extension method
        else return Unauthorized("Password Invalid");
    }
}
