using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class addOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Brands_BrandId",
                table: "Parts");

            migrationBuilder.DropIndex(
                name: "IX_Parts_BrandId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "Parts");

            migrationBuilder.AlterColumn<double>(
                name: "NewPrice",
                table: "Offers",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "DiscountRate",
                table: "Offers",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<string>(
                name: "BundlePartIdsCsv",
                table: "Offers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BuyQuantity",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndAt",
                table: "Offers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "FixedAmount",
                table: "Offers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FreePartId",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GetQuantity",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Offers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartAt",
                table: "Offers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Offers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Offers_FreePartId",
                table: "Offers",
                column: "FreePartId");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Parts_FreePartId",
                table: "Offers",
                column: "FreePartId",
                principalTable: "Parts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Parts_FreePartId",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_FreePartId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "BundlePartIdsCsv",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "BuyQuantity",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "EndAt",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "FixedAmount",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "FreePartId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "GetQuantity",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "StartAt",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Offers");

            migrationBuilder.AddColumn<int>(
                name: "BrandId",
                table: "Parts",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "NewPrice",
                table: "Offers",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "DiscountRate",
                table: "Offers",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Parts_BrandId",
                table: "Parts",
                column: "BrandId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Brands_BrandId",
                table: "Parts",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id");
        }
    }
}
