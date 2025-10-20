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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding;
namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")] // /api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        // if (await checkMailDuplication(dto.Email)) return BadRequest("Email is already in use");
        // if ( checkEmail2(dto.Email)) return BadRequest("Email is already in use");
        // using var hmac = new HMACSHA512();

        var appuser = new AppUser
        {
            DisplayName = dto.DisplayName,
            Email = dto.Email,
            UserName = dto.Email,
            // PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            // PasswordSalt = hmac.Key,
            Member = new Member
            {
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                Gender = dto.Gender,
                City = dto.City,
                Country = dto.Country,
                DateOfBirth = dto.DateOfBirth
            }

        };

        // context.Users.Add(appuser);
        // await context.SaveChangesAsync();
        var result = await userManager.CreateAsync(appuser, dto.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("identity", error.Description);

            }
            return ValidationProblem();



        }
        await userManager.AddToRoleAsync(appuser, "Member");

        await SetRefreshTokenCookie(appuser);

        return await appuser.toDto(tokenService);
    }
    // private async Task<bool> checkMailDuplication(string email)
    // {
    //     return await context.Users.AnyAsync(x => x.Email!.ToLower() == email.ToLower());
    // }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);

        // var user = await context.Users.SingleOrDefaultAsync(x => x.Email == dto.Email);
        if (user == null) return Unauthorized("Invalid Username");


        var result = await userManager.CheckPasswordAsync(user, dto.Password);

        if (!result) return BadRequest("Invalid password!");
        // using var hmac = new HMACSHA512(user.PasswordSalt);
        // var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
        // if (computedHash.SequenceEqual(user.PasswordHash))
        await SetRefreshTokenCookie(user);
        return await user.toDto(tokenService); //use extension method
        // else return Unauthorized("Password Invalid");
        
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return NoContent();

        var user = await userManager.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken && x.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null) return Unauthorized("Refresh Token not attributable to user");

        await SetRefreshTokenCookie(user);

        return await user.toDto(tokenService);

    }

    private async Task SetRefreshTokenCookie(AppUser user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, //sent only through https
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
