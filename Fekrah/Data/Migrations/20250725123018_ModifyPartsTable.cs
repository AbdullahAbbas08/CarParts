﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class ModifyPartsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Sellers_SellerId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "SellerId",
                table: "Parts",
                newName: "MerchantId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_SellerId",
                table: "Parts",
                newName: "IX_Parts_MerchantId");

            migrationBuilder.AddColumn<int>(
                name: "GovernorateId",
                table: "Sellers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "GovernorateId",
                table: "City",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Governorate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Governorate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Governorate_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Governorate_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_GovernorateId",
                table: "Sellers",
                column: "GovernorateId");

            migrationBuilder.CreateIndex(
                name: "IX_City_GovernorateId",
                table: "City",
                column: "GovernorateId");

            migrationBuilder.CreateIndex(
                name: "IX_Governorate_CreatedByUserId",
                table: "Governorate",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Governorate_UpdatedBy",
                table: "Governorate",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Sellers_MerchantId",
                table: "Parts",
                column: "MerchantId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Governorate_GovernorateId",
                table: "Sellers",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Sellers_MerchantId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Governorate_GovernorateId",
                table: "Sellers");

            migrationBuilder.DropTable(
                name: "Governorate");

            migrationBuilder.DropIndex(
                name: "IX_Sellers_GovernorateId",
                table: "Sellers");

            migrationBuilder.DropIndex(
                name: "IX_City_GovernorateId",
                table: "City");

            migrationBuilder.DropColumn(
                name: "GovernorateId",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "GovernorateId",
                table: "City");

            migrationBuilder.RenameColumn(
                name: "MerchantId",
                table: "Parts",
                newName: "SellerId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_MerchantId",
                table: "Parts",
                newName: "IX_Parts_SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Sellers_SellerId",
                table: "Parts",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
