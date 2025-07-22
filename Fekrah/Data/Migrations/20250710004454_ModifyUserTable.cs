using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class ModifyUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarsModels_Users_CreatedBy",
                table: "CarsModels");

            migrationBuilder.DropForeignKey(
                name: "FK_Localizations_Users_CreatedBy",
                table: "Localizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Users_CreatedBy",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Sellers");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Offers",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_CreatedBy",
                table: "Offers",
                newName: "IX_Offers_CreatedByUserId");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Localizations",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Localizations_CreatedBy",
                table: "Localizations",
                newName: "IX_Localizations_CreatedByUserId");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "CarsModels",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_CarsModels_CreatedBy",
                table: "CarsModels",
                newName: "IX_CarsModels_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedOn",
                table: "Users",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Photo",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SellerId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedBy",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedOn",
                table: "Users",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserType",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Sellers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "SellerCategories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedOn",
                table: "SellerCategories",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedBy",
                table: "SellerCategories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedOn",
                table: "SellerCategories",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CarsModelId",
                table: "Parts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "VisitorRegisters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorRegisters", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedByUserId",
                table: "Users",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UpdatedBy",
                table: "Users",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SellerCategories_CreatedByUserId",
                table: "SellerCategories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SellerCategories_UpdatedBy",
                table: "SellerCategories",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_CarsModels_Users_CreatedByUserId",
                table: "CarsModels",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Localizations_Users_CreatedByUserId",
                table: "Localizations",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Users_CreatedByUserId",
                table: "Offers",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SellerCategories_Users_CreatedByUserId",
                table: "SellerCategories",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SellerCategories_Users_UpdatedBy",
                table: "SellerCategories",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_CreatedByUserId",
                table: "Users",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_UpdatedBy",
                table: "Users",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarsModels_Users_CreatedByUserId",
                table: "CarsModels");

            migrationBuilder.DropForeignKey(
                name: "FK_Localizations_Users_CreatedByUserId",
                table: "Localizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Users_CreatedByUserId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_SellerCategories_Users_CreatedByUserId",
                table: "SellerCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_SellerCategories_Users_UpdatedBy",
                table: "SellerCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_CreatedByUserId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_UpdatedBy",
                table: "Users");

            migrationBuilder.DropTable(
                name: "VisitorRegisters");

            migrationBuilder.DropIndex(
                name: "IX_Users_CreatedByUserId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_UpdatedBy",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers");

            migrationBuilder.DropIndex(
                name: "IX_SellerCategories_CreatedByUserId",
                table: "SellerCategories");

            migrationBuilder.DropIndex(
                name: "IX_SellerCategories_UpdatedBy",
                table: "SellerCategories");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Photo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedOn",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserType",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "SellerCategories");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "SellerCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "SellerCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedOn",
                table: "SellerCategories");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Offers",
                newName: "CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_CreatedByUserId",
                table: "Offers",
                newName: "IX_Offers_CreatedBy");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Localizations",
                newName: "CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Localizations_CreatedByUserId",
                table: "Localizations",
                newName: "IX_Localizations_CreatedBy");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "CarsModels",
                newName: "CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_CarsModels_CreatedByUserId",
                table: "CarsModels",
                newName: "IX_CarsModels_CreatedBy");

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Sellers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "CarsModelId",
                table: "Parts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_CarsModels_Users_CreatedBy",
                table: "CarsModels",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Localizations_Users_CreatedBy",
                table: "Localizations",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Users_CreatedBy",
                table: "Offers",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_CarsModels_CarsModelId",
                table: "Parts",
                column: "CarsModelId",
                principalTable: "CarsModels",
                principalColumn: "Id");
        }
    }
}
