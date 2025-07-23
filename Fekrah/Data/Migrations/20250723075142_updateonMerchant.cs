using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class updateonMerchant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers");

            migrationBuilder.DropIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "NameEn",
                table: "City");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Sellers",
                newName: "RatingCount");

            migrationBuilder.RenameColumn(
                name: "Location",
                table: "Sellers",
                newName: "Slug");

            migrationBuilder.RenameColumn(
                name: "IsFavoritSeller",
                table: "Sellers",
                newName: "IsFavoriteMerchant");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Sellers",
                newName: "ShortDescription");

            migrationBuilder.AlterColumn<string>(
                name: "ShopName",
                table: "Sellers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sellers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Sellers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedOn",
                table: "Sellers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "Sellers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedOn",
                table: "Sellers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Sellers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Sellers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedBy",
                table: "Sellers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedOn",
                table: "Sellers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_SellerId",
                table: "Users",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Sellers_SellerId",
                table: "Users",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Sellers_SellerId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SellerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "UpdatedOn",
                table: "Sellers");

            migrationBuilder.RenameColumn(
                name: "Slug",
                table: "Sellers",
                newName: "Location");

            migrationBuilder.RenameColumn(
                name: "ShortDescription",
                table: "Sellers",
                newName: "ImageUrl");

            migrationBuilder.RenameColumn(
                name: "RatingCount",
                table: "Sellers",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "IsFavoriteMerchant",
                table: "Sellers",
                newName: "IsFavoritSeller");

            migrationBuilder.AlterColumn<string>(
                name: "ShopName",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "City",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
