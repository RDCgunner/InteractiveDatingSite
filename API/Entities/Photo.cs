using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities;

public class Photo
{
    public int Id { get; set; } //random number
    public required string Url { get; set; }//photo url
    public string? PublicId { get; set; } //

    //Navigation Property


    //[JsonIgnore]
    public Member Member { get; set; } = null!;

    public string MemberId { get; set; } = null!; //lisa-id

}
