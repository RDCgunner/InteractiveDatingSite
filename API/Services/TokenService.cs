using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService(IConfiguration config, UserManager<AppUser> userManager):ITokenService
{
    public async Task<string> CreateToken(AppUser appuser)
    {
        var tokenKey = config["TokenKey"] ?? throw new Exception("Cannot get token key");
        if (tokenKey.Length < 64) throw new Exception("Token key is too short");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);


        var claims = new List<Claim> //
        {
            new(ClaimTypes.Email, appuser.Email!),
            new(ClaimTypes.NameIdentifier, appuser.Id)
            //new("InformationAdded","ValueofThatclaim")
        };

        var roles = await userManager.GetRolesAsync(appuser);

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(15),
            SigningCredentials = cred
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }
}
